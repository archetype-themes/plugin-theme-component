import ArchieComponents from './ArchieComponents.js'

class ArchieCLICommands {
  // Build Command
  static BUILD_COMMAND = 'build'
  static BUILD_COMMAND_ALLOWED_COMPONENTS = [ArchieComponents.COLLECTION_COMPONENT_TYPE, ArchieComponents.SECTION_COMPONENT_TYPE]
  static BUILD_COMMAND_OPTIONS = [ArchieComponents.COLLECTION_COMPONENT_TYPE, ArchieComponents.SECTION_COMPONENT_TYPE]

  // Create Command
  static CREATE_COMMAND = 'create'
  static CREATE_COMMAND_ALLOWED_COMPONENTS = [ArchieComponents.COLLECTION_COMPONENT_TYPE]
  static CREATE_COMMAND_OPTIONS = [ArchieComponents.SECTION_COMPONENT_TYPE, ArchieComponents.SNIPPET_COMPONENT_TYPE]

  // Install Command
  static INSTALL_COMMAND = 'install'
  static INSTALL_COMMAND_ALLOWED_COMPONENTS = [ArchieComponents.THEME_COMPONENT_TYPE]
  static INSTALL_COMMAND_OPTIONS = [ArchieComponents.COLLECTION_COMPONENT_TYPE]

  // Watch Command
  static WATCH_FLAGS = ['-w', '--watch']
  static WATCH_FLAG_ALLOWED_COMMANDS = [this.BUILD_COMMAND, this.INSTALL_COMMAND]

  // All Available Commands and Options
  static AVAILABLE_COMMANDS = [this.BUILD_COMMAND, this.CREATE_COMMAND, this.INSTALL_COMMAND]
  static AVAILABLE_COMMAND_OPTIONS = [ArchieComponents.THEME_COMPONENT_TYPE, ArchieComponents.COLLECTION_COMPONENT_TYPE, ArchieComponents.SECTION_COMPONENT_TYPE, ArchieComponents.SNIPPET_COMPONENT_TYPE]

}

export default ArchieCLICommands
