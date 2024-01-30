import { Command, Flags } from '@oclif/core'
import { decodeToml } from '../../../../src/utils/TomlUtils.js'
import { readFileSync } from 'node:fs'
import { CONFIG_FILE_NAME } from '../../../../src/config/CLI.js'
import SessionFactory from '../../../../src/factory/SessionFactory.js'
import InstallCommand from '../../../../src/commands/InstallCommand.js'

export default class Install extends Command {
  static description = 'Install a collection of components'

  static flags = {
    watch: Flags.boolean({ char: 'w', description: 'Watch for changes' })
  }

  async run () {
    const { args, flags } = await this.parse(Install)

    // TODO: update process so we can install a single component
    const commandArgs = ['install']
    if (args.component) {
      commandArgs.push(args.component)
    }

    if (flags.watch) {
      commandArgs.push('--watch')
    }

    // Wait for component process to complete
    const config = /** @type {{component: import('../models/static/Session.js').CLIConfig}} */ (decodeToml(readFileSync(CONFIG_FILE_NAME, 'utf8')))
    SessionFactory.fromArgsAndManifest(commandArgs, config)
    await InstallCommand.execute()
  }
}
