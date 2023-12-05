import {
  BUILD_COMMAND_AVAILABLE_CALLER_TYPES,
  BUILD_COMMAND_AVAILABLE_TARGET_TYPES,
  BUILD_COMMAND_NAME,
  CREATE_COMMAND_AVAILABLE_CALLER_TYPES,
  CREATE_COMMAND_AVAILABLE_TARGET_TYPES,
  CREATE_COMMAND_DEFAULT_TARGET_TYPE,
  CREATE_COMMAND_NAME,
  DEV_COMMAND_AVAILABLE_CALLER_TYPES,
  DEV_COMMAND_AVAILABLE_TARGET_TYPES,
  DEV_COMMAND_NAME, INSTALL_COMMAND_AVAILABLE_CALLER_TYPES,
  INSTALL_COMMAND_AVAILABLE_TARGET_TYPES,
  INSTALL_COMMAND_DEFAULT_TARGET_TYPE, INSTALL_COMMAND_NAME
} from '../config/CLI.js'

import Components from '../config/Components.js'
import CommandLineInputError from '../errors/CommandLineInputError.js'

import InternalError from '../errors/InternalError.js'

/**
 * Get A Command's Available Caller Types
 * @param {string} command
 * @return {string[]}
 */
export function getAvailableCallerTypes (command) {
  switch (command) {
    case BUILD_COMMAND_NAME:
      return BUILD_COMMAND_AVAILABLE_CALLER_TYPES
    case CREATE_COMMAND_NAME:
      return CREATE_COMMAND_AVAILABLE_CALLER_TYPES
    case DEV_COMMAND_NAME:
      return DEV_COMMAND_AVAILABLE_CALLER_TYPES
    case INSTALL_COMMAND_NAME:
      return INSTALL_COMMAND_AVAILABLE_CALLER_TYPES
    default:
      throw new InternalError(`Invalid command "${command}"`)
  }
}

/**
 * Get A Command's Available Target Types
 * @param {string} command
 * @return {string[]}
 */
export function getAvailableTargetTypes (command) {
  switch (command) {
    case BUILD_COMMAND_NAME:
      return BUILD_COMMAND_AVAILABLE_TARGET_TYPES
    case CREATE_COMMAND_NAME:
      return CREATE_COMMAND_AVAILABLE_TARGET_TYPES
    case DEV_COMMAND_NAME:
      return DEV_COMMAND_AVAILABLE_TARGET_TYPES
    case INSTALL_COMMAND_NAME:
      return INSTALL_COMMAND_AVAILABLE_TARGET_TYPES
    default:
      throw new InternalError(`Invalid command "${command}"`)
  }
}

/**
 * Get A Command's Default Target Type
 * @param {string} command
 * @param {string} [targetName]
 * @returns {string}
 */
export function getDefaultTargetType (command, targetName) {
  switch (command) {
    case BUILD_COMMAND_NAME:
      return targetName ? Components.COMPONENT_TYPE_NAME : Components.COLLECTION_TYPE_NAME
    case CREATE_COMMAND_NAME:
      return CREATE_COMMAND_DEFAULT_TARGET_TYPE
    case DEV_COMMAND_NAME:
      return targetName ? Components.COMPONENT_TYPE_NAME : Components.COLLECTION_TYPE_NAME
    case INSTALL_COMMAND_NAME:
      return INSTALL_COMMAND_DEFAULT_TARGET_TYPE
    default:
      throw new InternalError(`Invalid command ${command}`)
  }
}

/**
 * Get A Command's Default Target Name
 * @param {string} componentType
 * @param {string} command
 * @param {string} commandOption
 * @param {string} packageName
 * @param {Object.<string,string[]>} collections
 * @return {null|string|Object}
 */
export function getDefaultTargets (componentType, command, commandOption, packageName, collections) {
  switch (command) {
    case BUILD_COMMAND_NAME:
    case DEV_COMMAND_NAME:
      if (componentType === commandOption) {
        return packageName
      }
      return null
    case CREATE_COMMAND_NAME:
      return null
    case INSTALL_COMMAND_NAME:
      if (Object.keys(collections).length) {
        return collections
      } else {
        throw new CommandLineInputError('No Default Collection found in configuration for install, please specify a collection name.')
      }
  }
}
