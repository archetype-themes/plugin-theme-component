// External Dependencies
import { Command, Flags } from '@oclif/core'

export default class Component extends Command {
  static description = 'Theme Component Plugin by Archetype Themes'

  static flags = {
    version: Flags.boolean({
      char: 'v',
      description: 'Display Plugin Version',
      required: false
    })
  }

  async run() {
    const { flags } = await this.parse(Component)

    if (flags.version) {
      this.log(`\nShopify CLI Version: ${this.config.version}`)
      const plugin = this.config.plugins.get('plugin-theme-component')
      this.log(`Theme Component Plugin Version: ${plugin?.version ?? 'unknown'}`)
    } else {
      this.log(
        '\nWelcome To The Theme Component Plugin by Archetype Themes.' +
          '\n\nUse the "--help" or "-h" flag to list available commands'
      )
    }
  }
}