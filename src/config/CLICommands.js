import Components from './Components.js'

class CLICommands {
  static BUILD_COMMAND_NAME = 'build'

  /** @type {string[]} **/
  static BUILD_COMMAND_COMPONENTS = [Components.COLLECTION_COMPONENT_TYPE_NAME, Components.SECTION_COMPONENT_TYPE_NAME]
  /** @type {string[]} **/
  static BUILD_COMMAND_OPTIONS = [Components.COLLECTION_COMPONENT_TYPE_NAME, Components.SECTION_COMPONENT_TYPE_NAME]

  static CREATE_COMMAND_NAME = 'create'
  /** @type {string[]} **/
  static CREATE_COMMAND_COMPONENTS = [Components.COLLECTION_COMPONENT_TYPE_NAME]
  /** @type {string[]} **/
  static CREATE_COMMAND_OPTIONS = [Components.SECTION_COMPONENT_TYPE_NAME, Components.SNIPPET_COMPONENT_TYPE_NAME]

  static INSTALL_COMMAND_NAME = 'install'
  /** @type {string[]} **/
  static INSTALL_COMMAND_COMPONENTS = [Components.THEME_COMPONENT_TYPE_NAME]
  /** @type {string[]} **/
  static INSTALL_COMMAND_OPTIONS = [Components.COLLECTION_COMPONENT_TYPE_NAME]
}

export default CLICommands
