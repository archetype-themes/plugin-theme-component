import CLICommands from './CLICommands.js'

class CLIFlags {
  static WATCH_FLAG_ACCEPTED_VALUES = ['-w', '--watch']
  static WATCH_FLAG_COMMANDS = [CLICommands.BUILD_COMMAND_NAME, CLICommands.INSTALL_COMMAND_NAME]
}

export default CLIFlags
