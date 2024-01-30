import { Args, Command } from '@oclif/core'
import { decodeToml } from '../../../../src/utils/TomlUtils.js'
import { readFileSync } from 'node:fs'
import { CONFIG_FILE_NAME } from '../../../../src/config/CLI.js'
import SessionFactory from '../../../../src/factory/SessionFactory.js'
import GenerateCommand from '../../../../src/commands/GenerateCommand.js'

export default class Generate extends Command {
  static args = {
    component: Args.string({ description: 'Component to generate', required: true })
  }

  static description = 'Generate a component'

  async run () {
    const { args } = await this.parse(Generate)

    const commandArgs = ['generate', 'component', args.component]

    // Wait for component process to complete
    const config = /** @type {{component: import('../models/static/Session.js').CLIConfig}} */ (decodeToml(readFileSync(CONFIG_FILE_NAME, 'utf8')))
    SessionFactory.fromArgsAndManifest(commandArgs, config)
    await GenerateCommand.execute()
  }
}
