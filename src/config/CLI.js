import Components from './Components.js'
import CLICommands from './CLICommands.js'

class CLI {
  static Commands = CLICommands
  static AVAILABLE_COMMANDS = [
    CLICommands.BUILD_COMMAND_NAME, CLICommands.CREATE_COMMAND_NAME, CLICommands.INSTALL_COMMAND_NAME
  ]

  static AVAILABLE_TARGET_TYPES = [
    Components.COLLECTION_TYPE_NAME,
    Components.COMPONENT_TYPE_NAME,
    Components.THEME_COMPONENT_TYPE_NAME
  ]

  static AVAILABLE_CALLER_TYPES = [
    Components.COLLECTION_TYPE_NAME,
    Components.COMPONENT_TYPE_NAME,
    Components.THEME_COMPONENT_TYPE_NAME
  ]
}

export default CLI
