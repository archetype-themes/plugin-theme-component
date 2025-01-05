/**
 * This command copies component files into a theme directory.
 * 
 * - Copies rendered component files (snippets and assets) into the theme directory
 * - Updates the theme CLI config (shopify.theme.json) with the component collection details
 */

import path from 'node:path'
import fs from 'node:fs'
import Args from '../../../utilities/args.js'    
import BaseCommand from '../../../utilities/base-command.js'
import Flags from '../../../utilities/flags.js'
import { getComponentMap } from '../../../utilities/component-map.js'
import { getThemeNodes } from '../../../utilities/nodes.js'
import { getNameFromPackageJson } from '../../../utilities/package-json.js'
import { getVersionFromPackageJson } from '../../../utilities/package-json.js'

export default class Copy extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.THEME_DIR
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
    const currentDir = process.cwd()
    const themeDir = path.resolve(currentDir, this.args[Args.THEME_DIR])
    
    const componentMap = getComponentMap(path.join(themeDir, 'component-map.json'))
    const themeNodes = getThemeNodes(themeDir)

    // Remove files that are not in the component map
    for (const node of themeNodes) {
      if (node.type === 'snippet' || node.type === 'asset') {
        const collection = node.type === 'snippet' ? componentMap.files.snippets : componentMap.files.assets;
        if (!collection[node.name]) {
          const filePath = path.join(themeDir, node.themeFolder, node.name);
          if (fs.existsSync(filePath)) {
            fs.rmSync(filePath);
          }
        }
      }
    }
  }
}
