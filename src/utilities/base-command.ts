import {Command} from '@oclif/core'

import Args from './args.js'
import Flags from './flags.js'
import { initializeConfig, themeComponentConfig } from './config.js'
import { initializeLogger } from './logger.js'

export default abstract class BaseCommand extends Command {
  protected args!: Args
  protected flags!: Flags

  protected async init(cmdClass: typeof BaseCommand = this.constructor as typeof BaseCommand): Promise<void> {
    await super.init()

    this.debug('Initializing logger')
    initializeLogger(this)

    this.debug('Parsing arguments and flags')
    const {args, flags} = await this.parse(cmdClass)
    this.flags = new Flags(flags)
    this.args = new Args(args)

    this.debug('Initializing global theme component pluginconfig')
    const themeDir = this.args[Args.THEME_DIR] || this.flags[Flags.COLLECTION_DEV_DIR]
    initializeConfig(this.flags, this.flags[Flags.THEME_CLI_CONFIG], themeDir)
  }
  
  // Helper to access config
  protected get themeComponentConfig() {
    return themeComponentConfig
  }
} 