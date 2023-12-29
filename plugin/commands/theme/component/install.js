import { Command } from '@oclif/core'
import { spawn } from 'node:child_process'

export default class Install extends Command {
  static description = 'Install a collection of components'

  async run () {
    const { args } = await this.parse(Install)

    const command = 'npm'
    // TODO: update archie so it can install a single component
    const commandArgs = ['exec', 'archie', 'install']
    if (args.component) {
      commandArgs.push(args.component)
    }

    const archie = spawn(command, commandArgs, {
      stdio: 'inherit'
    })

    // Wait for archie to complete
    await new Promise((resolve) => {
      archie.on('close', code => {
        resolve(code)
      })
    })
  }
}
