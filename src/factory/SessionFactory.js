// Node JS imports
import { exit } from 'node:process'

// Internal Imports
import {
  AVAILABLE_CALLER_TYPES,
  AVAILABLE_COMMANDS,
  AVAILABLE_TARGET_TYPES,
  WATCH_FLAG_ACCEPTED_VALUES,
  WATCH_FLAG_COMMANDS
} from '../config/CLI.js'
import CommandLineInputError from '../errors/CommandLineInputError.js'
import ConfigError from '../errors/ConfigError.js'
import {
  getAvailableCallerTypes,
  getAvailableTargetTypes,
  getDefaultTargets,
  getDefaultTargetType
} from '../utils/CLICommandUtils.js'
import logger from '../utils/Logger.js'
import NodeUtils from '../utils/NodeUtils.js'
import Session, { DEFAULT_DEV_THEME, DEFAULT_LOCALES_REPO } from '../models/static/Session.js'

class SessionFactory {
  /**
   * Session Factory method From Command Line Input
   * @param {string[]} commandLineArguments
   * @param {{archie: import('../models/static/Session.js').CLIConfig}} config
   * @return {Session}
   */
  static fromArgsAndManifest (commandLineArguments, config) {
    const [args, flags] = this.#splitArgs(commandLineArguments)

    if (args.length === 0) {
      this.#sayHi()
      exit(0)
    }

    this.#validatePackageManifest(config)

    Session.config = config.archie
    Session.callerType = config.archie.type.toLowerCase()
    Session.devTheme = config.archie['dev-theme'] ? config.archie['dev-theme'] : DEFAULT_DEV_THEME
    Session.localesRepo = config.archie['locales-repo'] ? config.archie['locales-repo'] : DEFAULT_LOCALES_REPO

    Session.command = args[0].toLowerCase()

    this.#validateCallerComponentType(Session.callerType)
    this.#validateCommand(Session.callerType, Session.command, AVAILABLE_COMMANDS)

    if (args[1] && args[2]) {
      Session.targetType = args[1].toLowerCase()
      Session.targets = args[2]
    } else if (args[1]) {
      // If we have only 1 further argument, check for a valid command option, or else, assume it is a Target Component Name
      const arg1 = args[1].toLowerCase()
      // first check for an existing command option,
      if (AVAILABLE_TARGET_TYPES.includes(arg1)) {
        Session.targetType = arg1
      } else {
        Session.targets = args[1]
      }
    }

    // Use the default Command Option if one wasn't provided
    if (!Session.targetType) {
      Session.targetType = getDefaultTargetType(Session.command, Session.targets)
    }

    // Use the default Target Component if one wasn't provided
    if (!Session.targets) {
      Session.targets =
        getDefaultTargets(
          Session.callerType,
          Session.command,
          Session.targetType,
          NodeUtils.getPackageName(),
          config?.archie.collections
        )
    }

    // Search for the Watch Mode flag
    Session.watchMode = WATCH_FLAG_ACCEPTED_VALUES.some((flag) => flags.includes(flag))

    logger.debug({
      'CLI Computed Arguments': {
        command: Session.command,
        'Command Target Type': Session.targetType,
        'Command Target Component(s)': Session.targets,
        'Command Watch Mode': Session.watchMode
      }
    })

    this.#validateCommandArguments(
      Session.callerType,
      Session.command,
      Session.targetType,
      Session.targets,
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
    console.log('The Archetype Theme CLI says hi!')
    if (command && commandOptions) {
      console.log(`Available options for the "${command}" command are [${commandOptions.join('/')}]`)
    } else {
      console.log('Available commands are build, dev, generate and install')
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

    if (watchFlag && !WATCH_FLAG_COMMANDS.includes(command)) {
      logger.warn(`Watch flag received but ignored => it has no effect on the "${command}" command`)
    }
  }

  /**
   * Validate Package Manifest
   * @param {Object} packageManifest
   */
  static #validatePackageManifest (packageManifest) {
    if (!packageManifest.archie?.type) {
      throw new ConfigError(`Couldn't find archie.type value in shopify.theme.toml. Please create the variable and set it to either one of these: ${AVAILABLE_CALLER_TYPES.join('/')}`)
    }
  }

  /**
   * Validate Component Type
   * @param {string} componentType
   * @throws {ConfigError} When Component Type Is Invalid
   * @return {void}
   */
  static #validateCallerComponentType (componentType) {
    if (!AVAILABLE_CALLER_TYPES.includes(componentType)) {
      throw new ConfigError(`Invalid Component Type: The value for archie.type from shopify.theme.toml must be changed to one of these: ${AVAILABLE_CALLER_TYPES.join('/')}, "${componentType}" is not an allowed value`)
    }
  }
}

export default SessionFactory
