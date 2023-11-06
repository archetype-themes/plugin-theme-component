// Node JS imports
import { exit } from 'node:process'
import CommandLineInputError from '../errors/CommandLineInputError.js'

// Internal Imports
import CLI from '../config/CLI.js'
import CLIFlags from '../config/CLIFlags.js'
import Session from '../models/static/Session.js'
import ConfigError from '../errors/ConfigError.js'
import {
  getAvailableCallerTypes,
  getAvailableTargetTypes,
  getDefaultTargetName,
  getDefaultTargetType
} from '../utils/CLICommandUtils.js'
import logger from '../utils/Logger.js'
import NodeUtils from '../utils/NodeUtils.js'

class SessionFactory {
  /**
   * Session Factory method From Command Line Input
   * @param {string[]} commandLineArguments
   * @param {{archie:CLIConfig}} packageManifest
   * @return {Session}
   */
  static fromArgsAndManifest (commandLineArguments, packageManifest) {
    const [args, flags] = this.#splitArgs(commandLineArguments)

    if (args.length === 0) {
      this.#sayHi()
      exit(0)
    }

    this.#validatePackageManifest(packageManifest)

    Session.config = packageManifest.archie
    Session.callerType = packageManifest.archie.type.toLowerCase()

    Session.command = args[0].toLowerCase()

    this.#validateCallerComponentType(Session.callerType)
    this.#validateCommand(Session.callerType, Session.command, CLI.AVAILABLE_COMMANDS)

    if (args[1] && args[2]) {
      Session.targetType = args[1].toLowerCase()
      Session.targetName = args[2]
    } else if (args[1]) {
      // If we have only 1 further argument, check for a valid command option, or else, assume it is a Target Component Name
      const arg1 = args[1].toLowerCase()
      // first check for an existing command option,
      if (CLI.AVAILABLE_TARGET_TYPES.includes(arg1)) {
        Session.targetType = arg1
      } else {
        Session.targetName = args[1]
      }
    }

    // Use the default Command Option if one wasn't provided
    if (!Session.targetType) {
      Session.targetType = getDefaultTargetType(Session.command, Session.callerType)
    }

    // Use the default Target Component if one wasn't provided
    if (!Session.targetName) {
      Session.targetName =
        getDefaultTargetName(
          Session.callerType,
          Session.command,
          Session.targetType,
          NodeUtils.getPackageName(),
          packageManifest?.archie.collections
        )
    }

    // Search for the Watch Mode flag
    Session.watchMode = CLIFlags.WATCH_FLAG_ACCEPTED_VALUES.some((flag) => flags.includes(flag))

    logger.debug({
      'CLI Computed Arguments': {
        command: Session.command,
        'Command Target Type': Session.targetType,
        'Command Target Component(s)': Session.targetName,
        'Command Watch Mode': Session.watchMode
      }
    })

    this.#validateCommandArguments(
      Session.callerType,
      Session.command,
      Session.targetType,
      Session.targetName,
      Session.watchMode
    )
    return Session
  }

  /**
   * CLI Says Hi!
   * @param {string} [command]
   * @param {string[]} [commandOptions]
   */
  static #sayHi (command, commandOptions) {
    console.log('The Archetype THeme CLI says hi!')
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
    const enabledComponentTypes = getAvailableCallerTypes(command)
    if (!enabledComponentTypes.includes(callerComponentType)) {
      throw new CommandLineInputError(`Invalid Component Type: "${callerComponentType}". The "${command}" command must be run from one of the following component type(s): [${enabledComponentTypes.join('/')}].`)
    }
  }

  /**
   * Validate Command Arguments
   * @param {string} callerType - CLI Caller Component Type
   * @param {string} command - CLI Command
   * @param {string} targetType - CLI Command Target Type
   * @param {string} targetName - CLI Command Target Name
   * @param {boolean} watchFlag - CLI Watch Flag Value
   */
  static #validateCommandArguments (callerType, command, targetType, targetName, watchFlag) {
    logger.debug(`Caller Component Type: ${callerType}`)

    const commandComponentTypes = getAvailableTargetTypes(command)
    if (!commandComponentTypes.includes(targetType)) {
      throw new CommandLineInputError(`Invalid Command Option "${targetType}". This command only accepts the following option(s): [${commandComponentTypes.join('/')}].`)
    }

    if (!targetName) {
      throw new CommandLineInputError(`Please specify a ${targetType} name. ie: npx archie ${command} ${targetType} some-smart-${targetType}-name`)
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
    if (!packageManifest.archie?.type) {
      throw new ConfigError(`Couldn't find archie.type value in package.json. Please create the variable and set it to either one of these: ${CLI.AVAILABLE_CALLER_TYPES.join('/')}`)
    }
  }

  /**
   * Validate Component Type
   * @param {string} componentType
   * @throws {ConfigError} When Component Type Is Invalid
   * @return {void}
   */
  static #validateCallerComponentType (componentType) {
    if (!CLI.AVAILABLE_CALLER_TYPES.includes(componentType)) {
      throw new ConfigError(`Invalid Component Type: The value for archie.type from package.json must be changed to one of these: ${CLI.AVAILABLE_CALLER_TYPES.join('/')}, "${componentType}" is not an allowed value`)
    }
  }
}

export default SessionFactory
