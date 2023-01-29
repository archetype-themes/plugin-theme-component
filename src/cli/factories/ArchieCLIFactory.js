// Node JS imports
import { exit } from 'node:process'

// Archie imports
import Collection from '../../models/Collection.js'
import Section from '../../models/Section.js'
import logger from '../../utils/Logger.js'
import NodeUtils from '../../utils/NodeUtils.js'

// Archie CLI imports
import BuildCommand from '../commands/BuildCommand.js'
import CreateCommand from '../commands/CreateCommand.js'
import InstallCommand from '../commands/InstallCommand.js'
import WatchFlag from '../flags/WatchFlag.js'
import ArchieCLI from '../models/ArchieCLI.js'
import ArchieConfig from '../models/ArchieConfig.js'

class ArchieCLIFactory {

  /**
   * Factory method for ArchieCLI From Command Line Input
   * @param {string[]} commandLineArguments
   * @return {ArchieCLI}
   */
  static fromCommandLineInput (commandLineArguments) {
    const [commands, flags] = this.#splitArgs(commandLineArguments)

    if (commands.length === 0) {
      this.#sayHi()
      exit(0)
    }

    const callerComponentType = ArchieConfig.componentType
    ArchieCLI.command = commands[0].toLowerCase()

    this.#validateCommand(callerComponentType, ArchieCLI.command, ArchieCLI.AVAILABLE_COMMANDS)

    // If we have 2 further arguments, we have both the option and the target
    if (commands[1] && commands[2]) {
      ArchieCLI.commandOption = commands[1].toLowerCase()
      ArchieCLI.targetComponentName = commands[2]
    }
    // If we have only 1 further argument, check for a valid command option, or else, assume it is a Target Component Name
    else if (commands[1]) {
      const arg = commands[1].toLowerCase()
      // first check for an existing command option,
      if (ArchieCLI.AVAILABLE_COMMAND_OPTIONS.includes(arg)) {
        ArchieCLI.commandOption = arg
      } else {
        ArchieCLI.targetComponentName = commands[1]
      }
    }

    // Use the default Command Option if one wasn't provided
    if (!ArchieCLI.commandOption) {
      ArchieCLI.commandOption = this.#getCommandDefaultOption(ArchieCLI.command, callerComponentType)
    }

    // Use the default Target Component if one wasn't provided
    if (!ArchieCLI.targetComponentName) {
      ArchieCLI.targetComponentName =
        this.#getCommandDefaultTargetComponent(callerComponentType, ArchieCLI.command, ArchieCLI.commandOption, NodeUtils.getPackageName())
    }

    // Search for the Watch Mode flag
    ArchieCLI.watchMode = WatchFlag.ACCEPTED_VALUES.some((flag) => flags.includes(flag))

    logger.debug({
      'Archie CLI Computed Arguments': {
        'command': ArchieCLI.command,
        'command option': ArchieCLI.commandOption,
        'command watch mode': ArchieCLI.watchMode,
        'command target component(s)': ArchieCLI.targetComponentName,
      }
    })

    this.#validateCommandArguments(callerComponentType, ArchieCLI.command, ArchieCLI.commandOption, ArchieCLI.targetComponentName, ArchieCLI.watchMode)
    return ArchieCLI
  }

  /**
   *
   * @param {string} callerComponentType
   * @param {string} command
   * @param {string[]} availableCommands
   */
  static #validateCommand (callerComponentType, command, availableCommands) {
    if (!availableCommands.includes(command)) {
      this.#sayHi()
      throw new Error(`Unknown command "${command}"`)
    }

    // Validate that the Component is entitled to call this Command
    const commandEnabledComponentTypes = this.#getCommandEnabledComponentTypes(command)
    if (!commandEnabledComponentTypes.includes(callerComponentType)) {
      throw new Error(`INVALID COMPONENT TYPE: "${callerComponentType}". This script can only be run from the following component(s): [${commandEnabledComponentTypes.join('/')}].`)
    }
  }

  static #validateCommandArguments (callerComponentType, command, commandOption, targetComponent, watchFlag) {
    logger.debug(`Caller Component Type: ${callerComponentType}`)

    const availableCommandOptions = this.#getCommandAvailableOptions(command)
    if (!availableCommandOptions.includes(commandOption)) {
      throw new Error(`INVALID COMMAND OPTION: "${commandOption}". This command only accepts the following option(s): [${availableCommandOptions.join('/')}].`)
    }

    if (!targetComponent) {
      throw new Error(`Please specify a ${commandOption} name. ie: yarn archie ${command} ${commandOption} some-smart-${commandOption}-name`)
    }

    if (watchFlag && !WatchFlag.ENABLED_COMMANDS.includes(command)) {
      logger.warn(`Watch flag received but ignored => it has no effect on the "${command}" command`)
    }
  }

  /**
   * Get Command Available Options
   * @param {string} command
   * @return {string[]}
   */
  static #getCommandAvailableOptions (command) {
    switch (command) {
      case BuildCommand.NAME:
        return BuildCommand.AVAILABLE_OPTIONS
      case CreateCommand.NAME:
        return CreateCommand.AVAILABLE_OPTIONS
      case InstallCommand.NAME:
        return InstallCommand.AVAILABLE_OPTIONS
      default:
        throw new Error(`ARCHIE UTILS: getCommandAvailableOptions => Unknown command "${command}"`)
    }
  }

  static #getCommandDefaultOption (command, callerComponentType) {
    switch (command) {
      case BuildCommand.NAME:
        return callerComponentType
      case CreateCommand.NAME:
        return Section.COMPONENT_NAME
      case InstallCommand.NAME:
        return Collection.COMPONENT_NAME
      default:
        throw new Error(`ARCHIE UTILS: getCommandDefaultOption => Unknown command ${command}`)
    }
  }

  /**
   *
   * @param {string} callerComponentType
   * @param {string} command
   * @param {string} commandOption
   * @param {string} packageName
   * @return {null|string|Object}
   */
  static #getCommandDefaultTargetComponent (callerComponentType, command, commandOption, packageName) {
    switch (command) {
      case BuildCommand.NAME:
        if (callerComponentType === commandOption) {
          return packageName
        }
        return null
      case CreateCommand.NAME:
        return null
      case InstallCommand.NAME:
        if (Object.keys(ArchieConfig.collections).length > 0)
          return Object.keys(ArchieConfig.collections)[0]
        else
          throw new Error(`No Default Collection found in configuration for install, please specify a collection name.`)
      default:
        throw new Error(`ARCHIE UTILS: getCommandDefaultTargetComponent => Unknown command ${command}`)
    }
  }

  /**
   * Get a list of Components that are allowed to call the specified command
   * @param {string} command
   * @return {string[]}
   */
  static #getCommandEnabledComponentTypes (command) {
    switch (command) {
      case BuildCommand.NAME:
        return BuildCommand.ENABLED_COMPONENTS
      case CreateCommand.NAME:
        return CreateCommand.ENABLED_COMPONENTS
      case InstallCommand.NAME:
        return InstallCommand.ENABLED_COMPONENTS
      default:
        throw new Error(`ARCHIE UTILS: getCommandEnabledComponentTypes => Unknown command ${command}`)
    }
  }

  /**
   * Archie Says Hi!
   * @param {string} [command]
   * @param {string[]} [commandOptions]
   */
  static #sayHi (command, commandOptions) {
    console.log(`Archie says hi!`)
    if (command && commandOptions) {
      console.log(`Available options for the "${command}" command are [${commandOptions.join('/')}]`)
    } else {
      console.log('Available commands are build, create and install')
    }
  }

  /**
   * Split Args into Commands and Flags
   * @param args
   * @return {[string[], string[]]}
   */
  static #splitArgs (args) {
    const commands = args.filter(arg => !arg.startsWith('-'))
    const flags = args.filter(arg => arg.startsWith('-'))
    return [commands, flags]
  }

}

export default ArchieCLIFactory
