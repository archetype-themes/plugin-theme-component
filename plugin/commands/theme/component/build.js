import { Args, Command, Flags } from '@oclif/core'
import { decodeToml } from '../../../../src/utils/TomlUtils.js'
import { readFileSync } from 'node:fs'
import { CONFIG_FILE_NAME } from '../../../../src/config/CLI.js'
import SessionFactory from '../../../../src/factory/SessionFactory.js'
import BuildCommand from '../../../../src/commands/BuildCommand.js'

export default class Build extends Command {
  static description = 'Build a component or collection of components'

  static args = {
    component: Args.string({ description: 'Component to build' })
  }

  static flags = {
    watch: Flags.boolean({ char: 'w', description: 'Watch for changes' }),
    debug: Flags.boolean({ description: 'Debug Mode is more verbose.' }),
    trace: Flags.boolean({ description: 'Trace Mode provides tracing and debug information.' })
  }

  async run () {
    const { args, flags } = await this.parse(Build)

    const commandArgs = ['build']
    if (args.component) {
      commandArgs.push(args.component)
    }

    if (flags.watch) {
      commandArgs.push('--watch')
    }

    // Wait for component process to complete
    const config = /** @type {{component: import('../models/static/Session.js').CLIConfig}} */ (decodeToml(readFileSync(CONFIG_FILE_NAME, 'utf8')))
    SessionFactory.fromArgsAndManifest(commandArgs, config)
    await BuildCommand.execute()
  }
}
