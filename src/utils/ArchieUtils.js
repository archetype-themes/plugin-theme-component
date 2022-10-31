import { exit } from 'node:process'
import NodeUtils from './NodeUtils.js'
import ArchieCLI from '../models/static/ArchieCLI.js'
import ArchieNodeConfig from '../models/static/ArchieNodeConfig.js'
import logger from './Logger.js'
import ArchieComponents from '../config/ArchieComponents.js'
import ArchieCLICommands from '../config/ArchieCLICommands.js'

class ArchieUtils {

  /**
   * Init Archie
   * @return {Promise<void>}
   */
  static async initArchie () {
    const [commands, flags] = this.splitArgs(NodeUtils.getArgs())

    if (commands.length === 0) {
      this.sayHi()
      exit(0)
    }

    const callerComponentType = ArchieNodeConfig.componentType
    ArchieCLI.command = commands[0].toLowerCase()

    this.validateCommand(callerComponentType, ArchieCLI.command, ArchieCLICommands.AVAILABLE_COMMANDS)

    // If we have 2 further arguments, we have both the option and the target
    if (commands[1] && commands[2]) {
      ArchieCLI.commandOption = commands[1].toLowerCase()
      ArchieCLI.targetComponent = commands[2]
    }
    // If we have only 1 further argument, check for a valid command option, or else, assume it is a Target Component Name
    else if (commands[1]) {
      const arg = commands[1].toLowerCase()
      // first check for an existing command option,
      if (ArchieCLICommands.AVAILABLE_COMMAND_OPTIONS.includes(arg)) {
        ArchieCLI.commandOption = arg
      } else {
        ArchieCLI.targetComponent = commands[1]
      }
    }

    // Use the default Command Option if one wasn't provided
    if (!ArchieCLI.commandOption) {
      ArchieCLI.commandOption = this.getCommandDefaultOption(ArchieCLI.command, callerComponentType)
    }

    // Use the default Target Component if one wasn't provided
    if (!ArchieCLI.targetComponent) {
      ArchieCLI.targetComponent = this.getCommandDefaultTargetComponent(callerComponentType, ArchieCLI.command, ArchieCLI.commandOption, NodeUtils.getPackageName())
    }

    // Search for the Watch Mode flag
    ArchieCLI.watchMode = ArchieCLICommands.WATCH_FLAGS.some((flag) => flags.includes(flag))

    logger.debug({
      'Archie CLI Computed Arguments': {
        'command': ArchieCLI.command,
        'command option': ArchieCLI.commandOption,
        'command watch mode': ArchieCLI.watchMode,
        'command target component(s)': ArchieCLI.targetComponent,
      }
    })

    this.validateCommandArguments(callerComponentType, ArchieCLI.command, ArchieCLI.commandOption, ArchieCLI.targetComponent, ArchieCLI.watchMode)
  }

  /**
   *
   * @param {string} callerComponentType
   * @param {string} command
   * @param {string[]} availableCommands
   */
  static validateCommand (callerComponentType, command, availableCommands) {
    if (!ArchieCLICommands.AVAILABLE_COMMANDS.includes(command)) {
      this.sayHi()
      throw new Error(`Unknown command "${command}"`)
    }

    // Validate that the Component is entitled to call this Command
    const allowedCommandComponentTypes = this.getCommandAllowedComponentTypes(ArchieCLI.command)
    if (!allowedCommandComponentTypes.includes(callerComponentType)) {
      throw new Error(`INVALID COMPONENT TYPE: "${callerComponentType}". This script can only be run from the following component(s): [${allowedCommandComponentTypes.join('/')}].`)
    }
  }

  static validateCommandArguments (callerComponentType, command, commandOption, targetComponent, watchFlag) {
    logger.debug(`Caller Component Type: ${callerComponentType}`)

    const availableCommandOptions = this.getCommandAvailableOptions(command)
    if (!availableCommandOptions.includes(commandOption)) {
      throw new Error(`INVALID COMMAND OPTION: "${commandOption}". This command only accepts the following option(s): [${availableCommandOptions.join('/')}].`)
    }

    if (!targetComponent) {
      throw new Error(`Please specify a ${commandOption} name. ie: yarn archie ${command} ${commandOption} some-smart-${commandOption}-name`)
    }

    if (watchFlag && !ArchieCLICommands.WATCH_FLAG_ALLOWED_COMMANDS.includes(command)) {
      logger.warn(`Watch flag received but ignored => it has no effect on the "${command}" command`)
    }
  }

  /**
   * Get Command Available Options
   * @param {string} command
   * @return {string[]}
   */
  static getCommandAvailableOptions (command) {
    switch (command) {
      case ArchieCLICommands.BUILD_COMMAND:
        return ArchieCLICommands.BUILD_COMMAND_OPTIONS
      case ArchieCLICommands.CREATE_COMMAND:
        return ArchieCLICommands.CREATE_COMMAND_OPTIONS
      case ArchieCLICommands.INSTALL_COMMAND:
        return ArchieCLICommands.INSTALL_COMMAND_OPTIONS
      default:
        throw new Error(`ARCHIE UTILS: getCommandAvailableOptions => Unknown command "${command}"`)
    }
  }

  static getCommandDefaultOption (command, callerComponentType) {
    switch (command) {
      case ArchieCLICommands.BUILD_COMMAND:
        return callerComponentType
      case ArchieCLICommands.CREATE_COMMAND:
        return ArchieComponents.SECTION_COMPONENT_TYPE
      case ArchieCLICommands.INSTALL_COMMAND:
        return ArchieComponents.COLLECTION_COMPONENT_TYPE
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
  static getCommandDefaultTargetComponent (callerComponentType, command, commandOption, packageName) {
    switch (command) {
      case ArchieCLICommands.BUILD_COMMAND:
        if (callerComponentType === commandOption) {
          return packageName
        }
        return null
      case ArchieCLICommands.CREATE_COMMAND:
        return null
      case ArchieCLICommands.INSTALL_COMMAND:
        return ArchieNodeConfig.collections
      default:
        throw new Error(`ARCHIE UTILS: getCommandDefaultTargetComponent => Unknown command ${command}`)
    }
  }

  /**
   * Get a list of Components that are allowed to call the specified command
   * @param {string} command
   * @return {string[]}
   */
  static getCommandAllowedComponentTypes (command) {
    switch (command) {
      case ArchieCLICommands.BUILD_COMMAND:
        return ArchieCLICommands.BUILD_COMMAND_ALLOWED_COMPONENTS
      case ArchieCLICommands.CREATE_COMMAND:
        return ArchieCLICommands.CREATE_COMMAND_ALLOWED_COMPONENTS
      case ArchieCLICommands.INSTALL_COMMAND:
        return ArchieCLICommands.INSTALL_COMMAND_ALLOWED_COMPONENTS
      default:
        throw new Error(`ARCHIE UTILS: getCommandAllowedComponentTypes => Unknown command ${command}`)
    }
  }

  /**
   * Validate Command Option
   * @param {string[]} args
   * @param {string} command
   * @param {string[]} availableOptions
   */
  static setArchieCommandOptionFromArgs (args, command, availableOptions) {
    if (!args[1]) {
      this.sayHi(command, availableOptions)
      exit(0)
    }

    return args[1].toLowerCase()

  }

  /**
   * Archie Says Hi!
   * @param {string} [command]
   * @param {string[]} [commandOptions]
   */
  static sayHi (command, commandOptions) {
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
  static splitArgs (args) {
    const commands = args.filter(arg => !arg.startsWith('-'))
    const flags = args.filter(arg => arg.startsWith('-'))
    return [commands, flags]
  }

}

export default ArchieUtils
