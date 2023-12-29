import { Args, Command } from '@oclif/core'
import { spawn } from 'node:child_process'

export default class Dev extends Command {
  static args = {
    component: Args.string({ description: 'Component to develop' })
  }

  static description = 'Develop a component in isolation or all components'

  async run () {
    const { args } = await this.parse(Dev)

    const command = 'npm'
    const commandArgs = ['exec', 'archie', 'dev']
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
