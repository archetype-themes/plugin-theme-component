import Components from './Components.js'
import CLICommands from './CLICommands.js'

class CLI {
  static Commands = CLICommands
  static AVAILABLE_COMMANDS = [
    CLICommands.BUILD_COMMAND_NAME, CLICommands.CREATE_COMMAND_NAME, CLICommands.INSTALL_COMMAND_NAME
  ]

  static AVAILABLE_COMMAND_OPTIONS = [
    Components.THEME_COMPONENT_NAME,
    Components.COLLECTION_COMPONENT_NAME,
    Components.SECTION_COMPONENT_NAME,
    Components.SNIPPET_COMPONENT_NAME
  ]

  static AVAILABLE_COMPONENT_TYPES = [
    Components.COLLECTION_COMPONENT_NAME,
    Components.SECTION_COMPONENT_NAME,
    Components.SNIPPET_COMPONENT_NAME,
    Components.THEME_COMPONENT_NAME
  ]
}

export default CLI