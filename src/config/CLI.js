import { BUILD_COMMAND_NAME } from '../commands/BuildCommand.js'
import { CREATE_COMMAND_NAME } from '../commands/CreateCommand.js'
import { INSTALL_COMMAND_NAME } from '../commands/InstallCommand.js'
import Components from './Components.js'

export const AVAILABLE_COMMANDS = [
  BUILD_COMMAND_NAME, CREATE_COMMAND_NAME, INSTALL_COMMAND_NAME
]

export const AVAILABLE_TARGET_TYPES = [
  Components.COLLECTION_TYPE_NAME,
  Components.COMPONENT_TYPE_NAME,
  Components.THEME_TYPE_NAME
]

export const AVAILABLE_CALLER_TYPES = [
  Components.COLLECTION_TYPE_NAME,
  Components.COMPONENT_TYPE_NAME,
  Components.THEME_TYPE_NAME
]

/** @type {string[]}  **/
export const WATCH_FLAG_ACCEPTED_VALUES = ['-w', '--watch']

/** @type {string[]}  **/
export const WATCH_FLAG_COMMANDS = [BUILD_COMMAND_NAME, INSTALL_COMMAND_NAME]
