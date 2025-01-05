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
import { getCollectionNodes } from '../../../utilities/nodes.js'
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
    const hasPackageJson = fs.existsSync(path.join(currentDir, 'package.json'))
    const hasComponentsDir = fs.existsSync(path.join(currentDir, 'components'))

    if (!hasPackageJson || !hasComponentsDir) {
      this.error('Warning: Current directory does not appear to be a component collection. Expected to find package.json and components directory.')
    }

    const themeDir = path.resolve(currentDir, this.args[Args.THEME_DIR])
    const collectionName = this.flags[Flags.COLLECTION_NAME] || getNameFromPackageJson(process.cwd())
    const collectionVersion = this.flags[Flags.COLLECTION_VERSION] || getVersionFromPackageJson(process.cwd())

    const componentMap = getComponentMap(path.join(themeDir, 'component-map.json'))
    const componentNodes = getCollectionNodes(currentDir)

    if (componentMap.collections[collectionName].version !== collectionVersion) {
      this.warn(`Version mismatch: Expected ${collectionVersion} but found ${componentMap.collections[collectionName].version}.`);
      return;
    }

    for (const [snippetName, snippetCollection] of Object.entries(componentMap.files.snippets)) {
      if (snippetCollection === collectionName) {
        const node = componentNodes.find(node => node.name === snippetName && node.themeFolder === 'snippets');
        if (node) {
          const src = node.file;
          const dest = path.join(themeDir, 'snippets', snippetName);
          copyFileIfChanged(src, dest);
        }
      }
    }

    for (const [assetName, assetCollection] of Object.entries(componentMap.files.assets)) {
      if (assetCollection === collectionName) {
        const node = componentNodes.find(node => node.name === assetName && node.themeFolder === 'assets');
        if (node) {
          const src = node.file;
          const dest = path.join(themeDir, 'assets', assetName);
          copyFileIfChanged(src, dest);
        }
      }
    }
  }
}

function copyFileIfChanged(src: string, dest: string) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  if (!fs.existsSync(dest) || fs.readFileSync(src, 'utf8') !== fs.readFileSync(dest, 'utf8')) {
    fs.copyFileSync(src, dest);
  }
}
