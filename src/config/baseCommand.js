// External dependencies
import { Command, Flags } from '@oclif/core'

// Internal dependencies
import { getTomlConfig } from '../utils/TomlUtils.js'
import Session from '../models/static/Session.js'
import { Levels } from '../utils/LoggerUtils.js'

export const COMPONENT_ARG_NAME = 'components'
export const LOCALES_FLAG_NAME = 'locales-path'

export class BaseCommand extends Command {
  static baseFlags = {
    debug: Flags.boolean({
      helpGroup: 'Debug',
      description: 'Debug Mode is more verbose.'
    }),
    trace: Flags.boolean({
      helpGroup: 'Debug',
      description: 'Trace Mode provides tracing and debug information.'
    })
  }

  /**
   * abstract run function for BaseCommand
   * @return {Promise<{component?: string, 'theme-path'?: string, 'locales-path'?: string, 'setup-files'?: boolean, watch?: boolean}|null>}
   */
  async run() {
    const tomlConfig = await getTomlConfig()
    Session.config = tomlConfig

    return tomlConfig
  }

  static setLogLevel(flags) {
    if (flags.trace) {
      Session.logLevel = Levels.Trace
    } else if (flags.debug) {
      Session.logLevel = Levels.Debug
    } else {
      Session.logLevel = Levels.Info
    }
  }
}
