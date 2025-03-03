/**
 * This command cleans up component files in a theme directory.
 *
 * - Removes component files (snippets and assets) that are not listed in the component map
 * - Ensures the theme directory only contains necessary component files
 */

import fs from 'node:fs'
import path from 'node:path'

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import { getManifest } from '../../../utilities/manifest.js'
import { getThemeNodes } from '../../../utilities/nodes.js'

export default class Clean extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.override(Args.THEME_DIR, { default: '.', required: false })
  ])

  static override description = 'Remove unused component files in a theme'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory'
  ]

  protected override async init(): Promise<void> {
    await super.init(Clean)
  }

  public async run(): Promise<void> {
    const themeDir = path.resolve(process.cwd(), this.args[Args.THEME_DIR])

    const manifest = getManifest(path.join(themeDir, 'component.manifest.json'))
    const themeNodes = await getThemeNodes(themeDir)

    // Remove files that are not in the component map
    for (const node of themeNodes) {
      if (node.type === 'snippet' || node.type === 'asset') {
        const collection = node.type === 'snippet' ? manifest.files.snippets : manifest.files.assets;
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
