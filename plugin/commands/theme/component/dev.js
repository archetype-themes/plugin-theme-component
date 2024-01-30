import { Args, Command } from '@oclif/core'
import DevCommand from '../../../../src/commands/DevCommand.js'
import { decodeToml } from '../../../../src/utils/TomlUtils.js'
import { readFileSync } from 'node:fs'
import { CONFIG_FILE_NAME } from '../../../../src/config/CLI.js'
import SessionFactory from '../../../../src/factory/SessionFactory.js'

export default class Dev extends Command {
  static args = {
    component: Args.string({ description: 'Component to develop' })
  }

  static description = 'Develop a component in isolation or all components'

  async run () {
    const { args } = await this.parse(Dev)

    const commandArgs = ['dev']
    if (args.component) {
      commandArgs.push(args.component)
    }

    // Wait for component process to complete
    const config = /** @type {{component: import('../models/static/Session.js').CLIConfig}} */ (decodeToml(readFileSync(CONFIG_FILE_NAME, 'utf8')))
    SessionFactory.fromArgsAndManifest(commandArgs, config)
    await DevCommand.execute()
  }
}
