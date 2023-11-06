import { BUILD_COMMAND_NAME } from '../commands/BuildCommand.js'
import { INSTALL_COMMAND_NAME } from '../commands/InstallCommand.js'

class CLIFlags {
  /** @type {string[]}  **/
  static WATCH_FLAG_ACCEPTED_VALUES = ['-w', '--watch']

  /** @type {string[]}  **/
  static WATCH_FLAG_COMMANDS = [BUILD_COMMAND_NAME, INSTALL_COMMAND_NAME]
}

export default CLIFlags
