// External Dependencies
import { Command, Flags } from '@oclif/core'

export default class Component extends Command {
  static description = 'Devkit plugin by Archetype Themes'

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
      const plugin = this.config.plugins.get('plugin-devkit')
      this.log(`Devkit plugin version: ${plugin?.version ?? 'unknown'}`)
    } else {
      this.log(
        '\nWelcome to the Devkit plugin by Archetype Themes.' +
        '\n\nUse the "--help" or "-h" flag to list available commands'
      )
    }
  }
}
