import CLICommands from './CLICommands.js'

class CLIFlags {
  /** @type {string[]}  **/
  static WATCH_FLAG_ACCEPTED_VALUES = ['-w', '--watch']

  /** @type {string[]}  **/
  static WATCH_FLAG_COMMANDS = [CLICommands.BUILD_COMMAND_NAME, CLICommands.INSTALL_COMMAND_NAME]
}

export default CLIFlags
