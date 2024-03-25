// External dependencies
import { Command, Flags, ux } from '@oclif/core'

// Internal dependencies
import { sessionFactory } from '../factory/SessionFactory.js'
import { getTomlConfig } from '../utils/TomlUtils.js'

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
    sessionFactory(this.id, tomlConfig)

    return tomlConfig
  }

  static setUxOutputLevel(flags) {
    if (flags.debug) {
      ux.config.outputLevel = 'debug'
    }
    if (flags.trace) {
      ux.config.outputLevel = 'trace'
    }
  }
}
