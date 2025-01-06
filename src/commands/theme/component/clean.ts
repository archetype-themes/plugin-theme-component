/**
 * This command cleans up component files in a theme directory.
 * 
 * - Removes component files (snippets and assets) that are not listed in the component map
 * - Ensures the theme directory only contains necessary component files
 */

import path from 'node:path'
import fs from 'node:fs'
import Args from '../../../utilities/args.js'    
import BaseCommand from '../../../utilities/base-command.js'
import Flags from '../../../utilities/flags.js'
import { getComponentMap } from '../../../utilities/component-map.js'
import { getThemeNodes } from '../../../utilities/nodes.js'

export default class Clean extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.override(Args.THEME_DIR, { required: false, default: '.' })
  ])

  static override description = 'Clean up component files in a theme directory'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory'
  ]

  protected override async init(): Promise<void> {
    await super.init(Clean)
  }

  public async run(): Promise<void> {
    const themeDir = path.resolve(process.cwd(), this.args[Args.THEME_DIR])
    
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
