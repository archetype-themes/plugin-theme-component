import Components from './Components.js'

class CLICommands {
  /** @type {string} **/
  static BUILD_COMMAND_NAME = 'build'

  /** @type {string[]} **/
  static BUILD_COMMAND_ENABLED_COMPONENT_TYPES = [Components.COLLECTION_TYPE_NAME, Components.COMPONENT_TYPE_NAME]

  /** @type {string} **/
  static CREATE_COMMAND_NAME = 'create'

  /** @type {string[]} **/
  static CREATE_COMMAND_ENABLED_COMPONENT_TYPES = [Components.COMPONENT_TYPE_NAME]

  /** @type {string} **/
  static INSTALL_COMMAND_NAME = 'install'

  /** @type {string[]} **/
  static INSTALL_COMMAND_ENABLED_COMPONENT_TYPES = [Components.COLLECTION_TYPE_NAME]
}

export default CLICommands
