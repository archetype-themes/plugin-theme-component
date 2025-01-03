import {Command} from '@oclif/core'

import Args from './args.js'
import Flags from './flags.js'
import { initializeConfig, themeComponentConfig } from './config.js'
import { initializeLogger } from './logger.js'
import path from 'node:path'

export default abstract class BaseCommand extends Command {
  protected args!: Args
  protected flags!: Flags

  protected async init(): Promise<void> {
    await super.init()
    initializeLogger(this)
    const {args, flags} = await this.parse()
    this.flags = new Flags(flags)
    this.args = new Args(args)

    // Initialize config with flags and config file path
    const configPath = path.join(process.cwd(), this.flags[Flags.THEME_CLI_CONFIG])
    initializeConfig(this.flags, configPath)

  }
  
  // Helper to access config
  protected get themeComponentConfig() {
    return themeComponentConfig
  }
} 