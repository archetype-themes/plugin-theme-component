/**
 * This command installs component files into a theme directory.
 * 
 * - Maps the components in the theme directory
 * - Copies rendered component files (snippets and assets) into the theme directory
 * - Cleans up unnecessary component files in the theme directory
 */

import path from 'node:path'
import fs from 'node:fs'
import Args from '../../../utilities/args.js'    
import BaseCommand from '../../../utilities/base-command.js'
import Flags from '../../../utilities/flags.js'

import Map from './map.js'
import Copy from './copy.js'
import Clean from './clean.js'

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
    Flags.COLLECTION_NAME,
    Flags.COLLECTION_VERSION
  ])

  protected override async init(): Promise<void> {
    await super.init(Copy)
  }

  public async run(): Promise<void> {
    await Map.run([this.args[Args.THEME_DIR]!])
    await Copy.run([this.args[Args.THEME_DIR]!])
    await Clean.run([this.args[Args.THEME_DIR]!])
  }
}