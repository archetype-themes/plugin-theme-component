import { Args, Command, Flags } from '@oclif/core'
import { spawn } from 'node:child_process'

export default class Build extends Command {
  static args = {
    component: Args.string({ description: 'Component to build' })
  }

  static description = 'Build a component or collection of components'

  static flags = {
    watch: Flags.boolean({ char: 'w', description: 'Watch for changes' })
  }

  async run () {
    const { args, flags } = await this.parse(Build)

    const command = 'npm'
    const commandArgs = ['exec', '--', 'component', 'build']
    if (args.component) {
      commandArgs.push(args.component)
    }

    if (flags.watch) {
      commandArgs.push('--watch')
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
