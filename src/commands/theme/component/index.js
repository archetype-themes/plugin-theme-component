// External Dependencies
import { Command, Flags } from '@oclif/core'

// Internal Dependencies
import { BaseCommand } from '../../../config/baseCommand.js'

export default class Component extends Command {
  static description = 'Theme Component Plugin - By Archetype Themes'

  static flags = {
    version: Flags.boolean({
      char: 'v',
      description: 'Display Plugin Version',
      required: false
    })
  }

  async run() {
    const { flags } = await this.parse(Component)
    BaseCommand.setUxOutputLevel(flags)

    if (flags.version) {
      this.log(`\nShopify CLI Version: ${this.config.version}`)
      this.log(`Theme Component Plugin Version: ${this.config.plugins.get('plugin-theme-component').version}`)
    } else {
      this.log(
        '\nWelcome To The Theme Component Plugin, by Archetype Themes.' +
          '\n\nUse the "--help" or "-h" flag to list available commands'
      )
    }
  }
}
