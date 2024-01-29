import { Command } from '@oclif/core'
import { spawn } from 'node:child_process'

export default class Install extends Command {
  static description = 'Install a collection of components'

  async run () {
    const { args } = await this.parse(Install)

    const command = 'npm'
    // TODO: update process so we can install a single component
    const commandArgs = ['exec', 'component', 'install']
    if (args.component) {
      commandArgs.push(args.component)
    }

    const componentProcess = spawn(command, commandArgs, {
      stdio: 'inherit'
    })

    // Wait for component process to complete
    await new Promise((resolve) => {
      componentProcess.on('close', code => {
        resolve(code)
      })
    })
  }
}
