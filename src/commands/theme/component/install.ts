import {Command} from '@oclif/core'
import { 
  copyComponents,
  updateThemeConfig
} from '../../../utilities/theme-files.js'    
import Flags from '../../../utilities/flags.js'
import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'

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

  public async run(): Promise<void> {
    // Copy components and get list of copied files
    const filesCopied = await copyComponents(
      this.args[Args.COMPONENT_SELECTOR], 
      this.args[Args.THEME_DIR]
    )

    // Update theme config with copied files
    await updateThemeConfig(filesCopied, this.args[Args.THEME_DIR])
  }
}


