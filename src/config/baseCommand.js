import { Command, Flags } from '@oclif/core'

export class BaseCommand extends Command {
  static baseFlags = {
    debug: Flags.boolean({
      helpGroup: 'Debug',
      description: 'Debug Mode is more verbose.'
    }),
    trace: Flags.boolean({
      helpGroup: 'Debug',
      description: 'Trace Mode provides tracing and debug information.'
    })
  }
}
