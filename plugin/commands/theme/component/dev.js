import { Args } from '@oclif/core'
import DevCommand from '../../../../src/commands/DevCommand.js'
import { decodeToml } from '../../../../src/utils/TomlUtils.js'
import { readFileSync } from 'node:fs'
import { CONFIG_FILE_NAME } from '../../../../src/config/CLI.js'
import SessionFactory from '../../../../src/factory/SessionFactory.js'
import FileUtils from '../../../../src/utils/FileUtils.js'
import { BaseCommand } from '../../../baseCommand.js'

export default class Dev extends BaseCommand {
  static description = 'Develop a component in isolation or all available components'

  static args = {
    component: Args.string({ description: 'Component to develop' })
  }

  async run () {
    const { args, flags } = await this.parse(Dev)

    // Validate that there is a toml file
    if (!await FileUtils.isReadable(CONFIG_FILE_NAME)) {
      console.log(this.config.debug)
      this.error(`Required file "${CONFIG_FILE_NAME}" file is missing`, {
        exit: 2,
        suggestions:
          ['Verify that you are in a components or theme repository root folder', 'Create shopify.theme.toml file']
      })
    }

    const commandArgs = ['dev']
    if (args.component) { commandArgs.push(args.component) }

    // Wait for component process to complete
    const config = /** @type {{component: import('../models/static/Session.js').CLIConfig}} */ (decodeToml(readFileSync(CONFIG_FILE_NAME, 'utf8')))
    SessionFactory.fromArgsAndManifest(commandArgs, config, flags)
    await DevCommand.execute()
  }
}
