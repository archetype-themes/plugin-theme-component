import ComponentsConfig from './ComponentsConfig.js'

class CommandsConfig {
  // Build Command
  static BUILD_COMMAND = 'build'
  static BUILD_COMMAND_ALLOWED_COMPONENTS = [ComponentsConfig.COLLECTION_COMPONENT_TYPE, ComponentsConfig.SECTION_COMPONENT_TYPE]
  static BUILD_COMMAND_OPTIONS = [ComponentsConfig.COLLECTION_COMPONENT_TYPE, ComponentsConfig.SECTION_COMPONENT_TYPE]

  // Create Command
  static CREATE_COMMAND = 'create'
  static CREATE_COMMAND_ALLOWED_COMPONENTS = [ComponentsConfig.COLLECTION_COMPONENT_TYPE]
  static CREATE_COMMAND_OPTIONS = [ComponentsConfig.SECTION_COMPONENT_TYPE, ComponentsConfig.SNIPPET_COMPONENT_TYPE]

  // Install Command
  static INSTALL_COMMAND = 'install'
  static INSTALL_COMMAND_ALLOWED_COMPONENTS = [ComponentsConfig.THEME_COMPONENT_TYPE]
  static INSTALL_COMMAND_OPTIONS = [ComponentsConfig.COLLECTION_COMPONENT_TYPE]

  // Watch Command
  static WATCH_FLAGS = ['-w', '--watch']
  static WATCH_FLAG_ALLOWED_COMMANDS = [this.BUILD_COMMAND, this.INSTALL_COMMAND]

  // All Available Commands and Options
  static AVAILABLE_COMMANDS = [this.BUILD_COMMAND, this.CREATE_COMMAND, this.INSTALL_COMMAND]
  static AVAILABLE_COMMAND_OPTIONS = [ComponentsConfig.THEME_COMPONENT_TYPE, ComponentsConfig.COLLECTION_COMPONENT_TYPE, ComponentsConfig.SECTION_COMPONENT_TYPE, ComponentsConfig.SNIPPET_COMPONENT_TYPE]

}

export default CommandsConfig
