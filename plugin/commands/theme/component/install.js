import { Flags } from '@oclif/core'
import { decodeToml } from '../../../../src/utils/TomlUtils.js'
import { readFileSync } from 'node:fs'
import { CONFIG_FILE_NAME } from '../../../../src/config/CLI.js'
import SessionFactory from '../../../../src/factory/SessionFactory.js'
import InstallCommand from '../../../../src/commands/InstallCommand.js'
import FileUtils from '../../../../src/utils/FileUtils.js'
import { BaseCommand } from '../../../baseCommand.js'

export default class Install extends BaseCommand {
  static description = 'Install a collection of components'

  static flags = {
    watch: Flags.boolean({ char: 'w', description: 'Watch for changes' })
  }

  async run () {
    const { flags } = await this.parse(Install)

    // Validate that there is a toml file
    if (!await FileUtils.isReadable(CONFIG_FILE_NAME)) {
      console.log(this.config.debug)
      this.error(`Required file "${CONFIG_FILE_NAME}" file is missing`, {
        exit: 2,
        suggestions:
          ['Verify that you are in a components or theme repository root folder', 'Create shopify.theme.toml file']
      })
    }

    // Wait for component process to complete
    const config = /** @type {{component: import('../models/static/Session.js').CLIConfig}} */ (decodeToml(readFileSync(CONFIG_FILE_NAME, 'utf8')))
    SessionFactory.fromArgsAndManifest(['install'], config, flags)
    await InstallCommand.execute()
  }
}
