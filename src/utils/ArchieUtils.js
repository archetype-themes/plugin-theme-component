import { env, exit } from 'node:process'
import NodeUtils from './NodeUtils.js'
import Archie from '../models/static/Archie.js'
import Config from '../models/static/Config.js'

class ArchieUtils {

  /**
   * Init Archie
   * @return {Promise<void>}
   */
  static async initArchie () {
    const args = NodeUtils.getArgs()
    if (!args[0]) {
      ArchieUtils.sayHi()
      exit(0)
    }

    // Set and validate command
    Archie.command = args[0].toLowerCase()
    ArchieUtils.validateCommand(Archie.command)

    // Set and validate Component Type
    await ArchieUtils.validateComponentType(this.getCommandAllowedComponents(Archie.command))

    if (Archie.command !== Archie.INSTALL_COMMAND) {
      Archie.commandOption = ArchieUtils.setArchieCommandOptionFromArgs(args, Archie.command, this.getCommandAvailableOptions(Archie.command))
    }
    Archie.targetComponent = ArchieUtils.findArchieComponentName(args, Archie.commandOption)

  }

  /**
   * Validate Command
   * @param {string} command
   */
  static validateCommand (command) {
    if (!Archie.AVAILABLE_COMMANDS.includes(command)) {
      this.sayHi()
      NodeUtils.exitWithError(`Unknown command "${command}"`)
    }
  }

  /**
   * Get Command Available Options
   * @param {string} command
   * @return {string[]}
   */
  static getCommandAvailableOptions (command) {
    switch (command) {
      case Archie.BUILD_COMMAND:
        return Archie.BUILD_COMMAND_OPTIONS
      case Archie.CREATE_COMMAND:
        return Archie.CREATE_COMMAND_OPTIONS
      case Archie.INSTALL_COMMAND:
        return []
      case Archie.WATCH_COMMAND:
        return Archie.WATCH_COMMAND_OPTIONS
      default:
        NodeUtils.exitWithError(`Unknown command ${command}`)
    }
  }

  static getCommandAllowedComponents (command) {
    switch (command) {
      case Archie.BUILD_COMMAND:
        return Archie.BUILD_COMMAND_ALLOWED_COMPONENTS
      case Archie.CREATE_COMMAND:
        return Archie.CREATE_COMMAND_ALLOWED_COMPONENTS
      case Archie.INSTALL_COMMAND:
        return Archie.INSTALL_COMMAND_ALLOWED_COMPONENTS
      case Archie.WATCH_COMMAND:
        return Archie.WATCH_COMMAND_ALLOWED_COMPONENTS
      default:
        NodeUtils.exitWithError(`Unknown command ${command}`)
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

    const commandOption = args[1].toLowerCase()

    if (!availableOptions.includes(commandOption)) {
      this.sayHi(command, availableOptions)
      NodeUtils.exitWithError(`Unknown command option "${commandOption}"`)
    }
    return commandOption
  }

  /**
   * Validate Component Type
   * @param {string[]} allowedComponentTypes
   * @return {Promise<void>}
   */
  static async validateComponentType (allowedComponentTypes) {
    if (!allowedComponentTypes.includes(Config.componentType)) {
      NodeUtils.exitWithError(`INVALID COMPONENT TYPE: "${Config.componentType}". This script can only be run from the following component(s): [${allowedComponentTypes.join('/')}].`)
    }
  }

  /**
   * Validate Component Name
   * @param {string[]} args
   * @param {string} commandOption
   */
  static findArchieComponentName (args, commandOption) {
    if (Config.componentType === commandOption) {
      return env.npm_package_name.includes('/') ? env.npm_package_name.split('/')[1] : env.npm_package_name
    } else {
      if (!args[2]) {
        NodeUtils.exitWithError(`Please specify a ${commandOption} name. ie: yarn archie ${Archie.command} ${commandOption} some-smart-${commandOption}-name`)
      }
      return args[2].toLowerCase()
    }
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
      console.log('Available commands are build/create/install/watch')
    }
  }

}

export default ArchieUtils
