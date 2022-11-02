import InstallCommand from '../commands/InstallCommand.js'
import BuildCommand from '../commands/BuildCommand.js'

class WatchFlag {
  // Watch Command
  static ACCEPTED_VALUES = ['-w', '--watch']
  static ENABLED_COMMANDS = [BuildCommand.NAME, InstallCommand.NAME]
}

export default WatchFlag
