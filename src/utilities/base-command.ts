import {Command} from '@oclif/core'

import Args from './args.js'
import Flags from './flags.js'
import { initializeLogger } from './logger.js'

export default abstract class BaseCommand extends Command {
  protected args!: Args
  protected flags!: Flags

  static override flags = Flags.getDefinitions([
    Flags.QUIET
  ])
  
  protected async init(cmdClass: typeof BaseCommand = this.constructor as typeof BaseCommand): Promise<void> {
    await super.init()

    this.debug('Initializing logger')
    initializeLogger(this)

    this.debug('Parsing arguments and flags')
    const {args, flags} = await this.parse(cmdClass)
    this.flags = new Flags(flags)
    this.args = new Args(args)
  }
} 