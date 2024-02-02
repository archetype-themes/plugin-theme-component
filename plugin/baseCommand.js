import { Command, Flags } from '@oclif/core'

export class BaseCommand extends Command {
  static baseFlags = {
    debug: Flags.boolean({ description: 'Debug Mode is more verbose.' }),
    trace: Flags.boolean({ description: 'Trace Mode provides tracing and debug information.' })
  }
}
