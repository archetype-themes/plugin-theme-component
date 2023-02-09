// Node JS imports
import { exit } from 'node:process'

// Archie imports
import logger from '../../utils/Logger.js'
import NodeUtils from '../../utils/NodeUtils.js'

// Archie CLI imports
import CLISession from '../models/CLISession.js'
import NodeConfig from '../models/NodeConfig.js'
import Components from '../../config/Components.js'
import CLICommands from '../../config/CLICommands.js'
import CLIFlags from '../../config/CLIFlags.js'
import CLI from '../../config/CLI.js'

class CLISessionFactory {

  /**
   * Factory method for ArchieCLI From Command Line Input
   * @param {string[]} commandLineArguments
   * @return {CLISession}
   */
  static fromCommandLineInput (commandLineArguments) {
    const [commands, flags] = this.#splitArgs(commandLineArguments)

    if (commands.length === 0) {
      this.#sayHi()
      exit(0)
    }

    const callerComponentType = NodeConfig.componentType
    CLISession.command = commands[0].toLowerCase()

    this.#validateCommand(callerComponentType, CLISession.command, CLI.AVAILABLE_COMMANDS)

    // If we have 2 further arguments, we have both the option and the target
    if (commands[1] && commands[2]) {
      CLISession.commandOption = commands[1].toLowerCase()
      CLISession.targetComponentName = commands[2]
    }
    // If we have only 1 further argument, check for a valid command option, or else, assume it is a Target Component Name
    else if (commands[1]) {
      const arg = commands[1].toLowerCase()
      // first check for an existing command option,
      if (CLI.AVAILABLE_COMMAND_OPTIONS.includes(arg)) {
        CLISession.commandOption = arg
      } else {
        CLISession.targetComponentName = commands[1]
      }
    }

    // Use the default Command Option if one wasn't provided
    if (!CLISession.commandOption) {
      CLISession.commandOption = this.#getCommandDefaultOption(CLISession.command, callerComponentType)
    }

    // Use the default Target Component if one wasn't provided
    if (!CLISession.targetComponentName) {
      CLISession.targetComponentName =
        this.#getCommandDefaultTargetComponent(
          callerComponentType,
          CLISession.command,
          CLISession.commandOption,
          NodeUtils.getPackageName()
        )
    }

    // Search for the Watch Mode flag
    CLISession.watchMode = CLIFlags.WATCH_FLAG_ACCEPTED_VALUES.some((flag) => flags.includes(flag))

    logger.debug({
      'Archie CLI Computed Arguments': {
        'command': CLISession.command,
        'command option': CLISession.commandOption,
        'command watch mode': CLISession.watchMode,
        'command target component(s)': CLISession.targetComponentName
      }
    })

    this.#validateCommandArguments(
      callerComponentType,
      CLISession.command,
      CLISession.commandOption,
      CLISession.targetComponentName,
      CLISession.watchMode
    )
    return CLISession
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
      throw new Error(`INVALID COMPONENT TYPE: "${callerComponentType}". This script can only be run from the following component(s): [${commandEnabledComponentTypes.join(
        '/')}].`)
    }
  }

  static #validateCommandArguments (callerComponentType, command, commandOption, targetComponent, watchFlag) {
    logger.debug(`Caller Component Type: ${callerComponentType}`)

    const availableCommandOptions = this.#getCommandAvailableOptions(command)
    if (!availableCommandOptions.includes(commandOption)) {
      throw new Error(`INVALID COMMAND OPTION: "${commandOption}". This command only accepts the following option(s): [${availableCommandOptions.join(
        '/')}].`)
    }

    if (!targetComponent) {
      throw new Error(`Please specify a ${commandOption} name. ie: npx archie ${command} ${commandOption} some-smart-${commandOption}-name`)
    }

    if (watchFlag && !CLIFlags.WATCH_FLAG_COMMANDS.includes(command)) {
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
      case CLICommands.BUILD_COMMAND_NAME:
        return CLICommands.BUILD_COMMAND_OPTIONS
      case CLICommands.CREATE_COMMAND_NAME:
        return CLICommands.CREATE_COMMAND_OPTIONS
      case CLICommands.INSTALL_COMMAND_NAME:
        return CLICommands.INSTALL_COMMAND_OPTIONS
      default:
        throw new Error(`ARCHIE UTILS: getCommandAvailableOptions => Unknown command "${command}"`)
    }
  }

  static #getCommandDefaultOption (command, callerComponentType) {
    switch (command) {
      case CLICommands.BUILD_COMMAND_NAME:
        return callerComponentType
      case CLICommands.CREATE_COMMAND_NAME:
        return Components.SECTION_COMPONENT_NAME
      case CLICommands.INSTALL_COMMAND_NAME:
        return Components.COLLECTION_COMPONENT_NAME
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
      case CLICommands.BUILD_COMMAND_NAME:
        if (callerComponentType === commandOption) {
          return packageName
        }
        return null
      case CLICommands.CREATE_COMMAND_NAME:
        return null
      case CLICommands.INSTALL_COMMAND_NAME:
        if (Object.keys(NodeConfig.collections).length > 0)
          return Object.keys(NodeConfig.collections)[0]
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
      case CLICommands.BUILD_COMMAND_NAME:
        return CLICommands.BUILD_COMMAND_COMPONENTS
      case CLICommands.CREATE_COMMAND_NAME:
        return CLICommands.CREATE_COMMAND_COMPONENTS
      case CLICommands.INSTALL_COMMAND_NAME:
        return CLICommands.INSTALL_COMMAND_COMPONENTS
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

export default CLISessionFactory
