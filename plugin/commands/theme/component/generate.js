import { Args, Command } from '@oclif/core'
import { spawn } from 'node:child_process'

export default class Generate extends Command {
  static args = {
    component: Args.string({ description: 'Component to generate', required: true })
  }

  static description = 'Generate a component'

  async run () {
    const { args } = await this.parse(Generate)

    const command = 'npm'

    const commandArgs = ['exec', 'archie', 'generate', 'component', args.component]

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
