import {Command} from '@oclif/core'

import Args from '../../../utilities/args.js'    
import BaseCommand from '../../../utilities/base-command.js'
import {updateThemeConfig} from '../../../utilities/config.js'
import Flags from '../../../utilities/flags.js'
import {copyComponents} from '../../../utilities/theme-files.js'

export default class Install extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.THEME_DIR,
    Args.COMPONENT_SELECTOR
  ])

  static override description = 'Install components into a theme'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory',
    '<%= config.bin %> <%= command.id %> theme-directory header',
    '<%= config.bin %> <%= command.id %> theme-directory header,footer,navigation'
  ]

  static override flags = Flags.getDefinitions([
    Flags.THEME_CLI_CONFIG,
    Flags.COLLECTION_COMPONENT_DIR,
    Flags.COLLECTION_NAME
  ])

  protected override async init(): Promise<void> {
    await super.init(Install)
  }

  public async run(): Promise<void> {
    this.log(`Copying components to theme directory ${this.args[Args.THEME_DIR]}`)
    const filesCopied = await copyComponents(
      this.args[Args.COMPONENT_SELECTOR], 
      this.args[Args.THEME_DIR]
    )
    this.log(`Copied ${filesCopied.size} files to theme directory ${this.args[Args.THEME_DIR]}`)

    this.log(`Updating theme config ${this.flags[Flags.THEME_CLI_CONFIG]}...`)
    await updateThemeConfig(filesCopied, this.args[Args.THEME_DIR])
    this.log(`Theme config updated`)
  }
}


