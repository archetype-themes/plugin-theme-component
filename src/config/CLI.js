import Components from './Components.js'

/** @type {string} **/
export const BUILD_COMMAND_NAME = 'build'

/** @type {string[]} **/
export const BUILD_COMMAND_AVAILABLE_CALLER_TYPES = [Components.COLLECTION_TYPE_NAME, Components.COMPONENT_TYPE_NAME]

/** @type {string[]} **/
export const BUILD_COMMAND_AVAILABLE_TARGET_TYPES = [Components.COLLECTION_TYPE_NAME, Components.COMPONENT_TYPE_NAME]

/** @type {string} **/
export const BUILD_FOLDER_NAME = 'build'

/** @type {string} **/
export const CREATE_COMMAND_NAME = 'create'

/** @type {string[]} **/
export const CREATE_COMMAND_AVAILABLE_CALLER_TYPES = [Components.COLLECTION_TYPE_NAME]

/** @type {string[]} **/
export const CREATE_COMMAND_AVAILABLE_TARGET_TYPES = [Components.COMPONENT_TYPE_NAME]

/** @type {string} **/
export const CREATE_COMMAND_DEFAULT_TARGET_TYPE = Components.COMPONENT_TYPE_NAME

/** @type {string} **/
export const DEV_COMMAND_NAME = 'dev'

/** @type {string[]} **/
export const DEV_COMMAND_AVAILABLE_CALLER_TYPES = [Components.COLLECTION_TYPE_NAME]

/** @type {string[]} **/
export const DEV_COMMAND_AVAILABLE_TARGET_TYPES = [Components.COLLECTION_TYPE_NAME, Components.COMPONENT_TYPE_NAME]

export const DEV_DEFAULT_THEME = 'https://github.com/archetype-themes/expanse.git'

export const JS_PROCESSOR = 'importmap'

/** @type {string} **/
export const DEV_FOLDER_NAME = '.explorer'

/** @type {string} **/
export const INSTALL_COMMAND_NAME = 'install'

/** @type {string[]} **/
export const INSTALL_COMMAND_AVAILABLE_CALLER_TYPES = [Components.THEME_TYPE_NAME]

/** @type {string[]} **/
export const INSTALL_COMMAND_AVAILABLE_TARGET_TYPES = [Components.COLLECTION_TYPE_NAME]

/** @type {string} **/
export const INSTALL_COMMAND_DEFAULT_TARGET_TYPE = Components.COLLECTION_TYPE_NAME

/** @type {string[]} **/
export const AVAILABLE_COMMANDS = [
  BUILD_COMMAND_NAME, CREATE_COMMAND_NAME, DEV_COMMAND_NAME, INSTALL_COMMAND_NAME
]

/** @type {string[]} **/
export const AVAILABLE_TARGET_TYPES = [
  Components.COLLECTION_TYPE_NAME,
  Components.COMPONENT_TYPE_NAME,
  Components.THEME_TYPE_NAME
]

/** @type {string[]} **/
export const AVAILABLE_CALLER_TYPES = [
  Components.COLLECTION_TYPE_NAME,
  Components.COMPONENT_TYPE_NAME,
  Components.THEME_TYPE_NAME
]

/** @type {string[]}  **/
export const WATCH_FLAG_ACCEPTED_VALUES = ['-w', '--watch']

/** @type {string[]}  **/
export const WATCH_FLAG_COMMANDS = [BUILD_COMMAND_NAME, INSTALL_COMMAND_NAME]
