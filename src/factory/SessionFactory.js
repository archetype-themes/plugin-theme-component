// Node JS imports
import { exit } from 'node:process'
import CommandLineInputError from '../errors/CommandLineInputError.js'

// Archie imports
import CLI from '../config/CLI.js'
import CLICommands from '../config/CLICommands.js'
import CLIFlags from '../config/CLIFlags.js'
import Session from '../models/static/Session.js'
import Components from '../config/Components.js'
import ConfigError from '../errors/ConfigError.js'
import InternalError from '../errors/InternalError.js'
import logger from '../utils/Logger.js'
import NodeUtils from '../utils/NodeUtils.js'

class SessionFactory {
  /**
   * Factory method for ArchieCLI From Command Line Input
   * @param {string[]} commandLineArguments
   * @param {{archie:ArchieConfig}} packageManifest
   * @return {Session}
   */
  static fromArgsAndManifest (commandLineArguments, packageManifest) {
    const [commands, flags] = this.#splitArgs(commandLineArguments)

    if (commands.length === 0) {
      this.#sayHi()
      exit(0)
    }

    this.#validatePackageManifest(packageManifest)

    Session.archieConfig = packageManifest.archie
    Session.componentType = packageManifest.archie.componentType.toLowerCase()

    Session.command = commands[0].toLowerCase()

    this.#validateComponentType(Session.componentType)
    this.#validateCommand(Session.componentType, Session.command, CLI.AVAILABLE_COMMANDS)

    if (commands[1] && commands[2]) {
      // If we have 2 further arguments, we have both the option and the target
      Session.commandOption = commands[1].toLowerCase()
      Session.targetComponentName = commands[2]
    } else if (commands[1]) {
      // If we have only 1 further argument, check for a valid command option, or else, assume it is a Target Component Name
      const arg = commands[1].toLowerCase()
      // first check for an existing command option,
      if (CLI.AVAILABLE_COMMAND_OPTIONS.includes(arg)) {
        Session.commandOption = arg
      } else {
        Session.targetComponentName = commands[1]
      }
    }

    // Use the default Command Option if one wasn't provided
    if (!Session.commandOption) {
      Session.commandOption = this.#getCommandDefaultOption(Session.command, Session.componentType)
    }

    // Use the default Target Component if one wasn't provided
    if (!Session.targetComponentName) {
      Session.targetComponentName =
        this.#getCommandDefaultTargetComponent(
          Session.componentType,
          Session.command,
          Session.commandOption,
          NodeUtils.getPackageName(),
          packageManifest?.archie.collections
        )
    }

    // Search for the Watch Mode flag
    Session.watchMode = CLIFlags.WATCH_FLAG_ACCEPTED_VALUES.some((flag) => flags.includes(flag))

    logger.debug({
      'Archie CLI Computed Arguments': {
        command: Session.command,
        'command option': Session.commandOption,
        'command watch mode': Session.watchMode,
        'command target component(s)': Session.targetComponentName
      }
    })

    this.#validateCommandArguments(
      Session.componentType,
      Session.command,
      Session.commandOption,
      Session.targetComponentName,
      Session.watchMode
    )
    return Session
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
        throw new InternalError(`Invalid command "${command}"`)
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
        throw new InternalError(`Invalid command ${command}`)
    }
  }

  /**
   *
   * @param {string} componentType
   * @param {string} command
   * @param {string} commandOption
   * @param {string} packageName
   * @param {Object.<string,string[]>} collections
   * @return {null|string|Object}
   */
  static #getCommandDefaultTargetComponent (componentType, command, commandOption, packageName, collections) {
    switch (command) {
      case CLICommands.BUILD_COMMAND_NAME:
        if (componentType === commandOption) {
          return packageName
        }
        return null
      case CLICommands.CREATE_COMMAND_NAME:
        return null
      case CLICommands.INSTALL_COMMAND_NAME:
        if (Object.keys(collections).length) {
          return collections
        } else {
          throw new CommandLineInputError('No Default Collection found in configuration for install, please specify a collection name.')
        }
      default:
        throw new InternalError(`Invalid command ${command}`)
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
        throw new InternalError(`Invalid command ${command}`)
    }
  }

  /**
   * Archie Says Hi!
   * @param {string} [command]
   * @param {string[]} [commandOptions]
   */
  static #sayHi (command, commandOptions) {
    console.log('Archie says hi!')
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

  /**
   *
   * @param {string} callerComponentType
   * @param {string} command
   * @param {string[]} availableCommands
   */
  static #validateCommand (callerComponentType, command, availableCommands) {
    if (!availableCommands.includes(command)) {
      this.#sayHi()
      throw new CommandLineInputError(`Unknown command "${command}"`)
    }

    // Validate that the Component is entitled to call this Command
    const commandEnabledComponentTypes = this.#getCommandEnabledComponentTypes(command)
    if (!commandEnabledComponentTypes.includes(callerComponentType)) {
      throw new CommandLineInputError(`Invalid Component Type: "${callerComponentType}". This script can only be run from the following component(s): [${commandEnabledComponentTypes.join('/')}].`)
    }
  }

  /**
   * Validate Command Arguments
   * @param {string} callerComponentType
   * @param {string} command
   * @param {string} commandOption
   * @param {string} targetComponent
   * @param {boolean} watchFlag
   */
  static #validateCommandArguments (callerComponentType, command, commandOption, targetComponent, watchFlag) {
    logger.debug(`Caller Component Type: ${callerComponentType}`)

    const availableCommandOptions = this.#getCommandAvailableOptions(command)
    if (!availableCommandOptions.includes(commandOption)) {
      throw new CommandLineInputError(`Invalid Command Option "${commandOption}". This command only accepts the following option(s): [${availableCommandOptions.join('/')}].`)
    }

    if (!targetComponent) {
      throw new CommandLineInputError(`Please specify a ${commandOption} name. ie: npx archie ${command} ${commandOption} some-smart-${commandOption}-name`)
    }

    if (watchFlag && !CLIFlags.WATCH_FLAG_COMMANDS.includes(command)) {
      logger.warn(`Watch flag received but ignored => it has no effect on the "${command}" command`)
    }
  }

  /**
   * Validate Package Manifest
   * @param {Object} packageManifest
   */
  static #validatePackageManifest (packageManifest) {
    if (!packageManifest.archie?.componentType) {
      throw new ConfigError(`Couldn't find archie.componentType value in package.json. Please create the variable and set it to either one of these: ${CLI.AVAILABLE_COMPONENT_TYPES.join('/')}`)
    }
  }

  /**
   * Validate Component Type
   * @param {string} componentType
   * @throws {ConfigError} When Component Type Is Invalid
   * @return {void}
   */
  static #validateComponentType (componentType) {
    if (!CLI.AVAILABLE_COMPONENT_TYPES.includes(componentType)) {
      throw new ConfigError(`Invalid Archie Component Type: The value for archie.componentType from package.json must be changed to one of these: ${CLI.AVAILABLE_COMPONENT_TYPES.join('/')}, "${componentType}" is not an allowed value`)
    }
  }
}

export default SessionFactory
