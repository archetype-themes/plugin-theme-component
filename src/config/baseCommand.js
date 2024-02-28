import { Command, Flags } from '@oclif/core'
import Session from '../models/static/Session.js'
import { getTomlConfig } from '../utils/TomlUtils.js'
import { sessionFactory } from '../factory/SessionFactory.js'

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
  async run () {
    const commandElements = this.id.split(':')
    Session.command = commandElements[commandElements.length - 1]

    const tomlConfig = await getTomlConfig()
    sessionFactory(this.id, tomlConfig)

    return tomlConfig
  }
}
