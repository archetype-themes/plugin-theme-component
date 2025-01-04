/**
 * This command copies component files into a theme directory.
 * 
 * - Copies rendered component files (snippets and assets) into the theme directory
 * - Updates the theme CLI config (shopify.theme.json) with the component collection details
 */

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

  static override description = 'Copy components files into a theme'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory',
    '<%= config.bin %> <%= command.id %> theme-directory header',
    '<%= config.bin %> <%= command.id %> theme-directory header,footer,navigation'
  ]

  static override flags = Flags.getDefinitions([
    Flags.THEME_CLI_CONFIG,
    Flags.COLLECTION_COMPONENT_DIR,
    Flags.COLLECTION_NAME,
    Flags.GENERATE_IMPORT_MAP
  ])

  protected override async init(): Promise<void> {
    await super.init(Install)
  }

  public async run(): Promise<void> {
    this.log(`Copying component snippets and assets to theme directory...`)
    const filesCopied = await copyComponents(
      this.args[Args.COMPONENT_SELECTOR], 
      this.args[Args.THEME_DIR]
    )
    this.log(`Copied ${filesCopied.size} files`)

    this.log(`Updating ${this.flags[Flags.THEME_CLI_CONFIG]}...`)
    await updateThemeConfig(filesCopied, this.args[Args.THEME_DIR])
    this.log(`${this.flags[Flags.THEME_CLI_CONFIG]} updated`)

    if (this.flags[Flags.GENERATE_IMPORT_MAP]) {
      this.log('Generating import map...')
      await this.config.runCommand('theme:generate:import-map', [this.args[Args.THEME_DIR]])
    }
  }
}


