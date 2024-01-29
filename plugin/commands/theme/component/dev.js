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
    const commandArgs = ['exec', 'component', 'dev']
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
