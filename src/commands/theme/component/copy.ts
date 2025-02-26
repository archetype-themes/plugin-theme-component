/**
 * This command copies component files into a theme directory.
 *
 * - Copies rendered component files (snippets and assets) into the theme directory
 * - Updates the theme CLI config (shopify.theme.json) with the component collection details
 */

import fs from 'node:fs'
import path from 'node:path'

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import { copyFileIfChanged } from '../../../utilities/files.js';
import Flags from '../../../utilities/flags.js'
import { getManifest } from '../../../utilities/manifest.js'
import { getCollectionNodes } from '../../../utilities/nodes.js'
import { getNameFromPackageJson, getVersionFromPackageJson } from '../../../utilities/package-json.js'

export default class Copy extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.THEME_DIR
  ])

  static override description = 'Copy files from a component collection into a theme'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory'
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

    if (!fs.existsSync(path.join(themeDir, 'component.manifest.json'))) {
      this.error('Error: component.manifest.json file not found in the theme directory. Run "shopify theme component map" to generate a component.manifest.json file.');
    }

    const manifest = getManifest(path.join(themeDir, 'component.manifest.json'))
    const componentNodes = await getCollectionNodes(currentDir)

    if (manifest.collections[collectionName].version !== collectionVersion) {
      this.error(`Version mismatch: Expected ${collectionVersion} but found ${manifest.collections[collectionName].version}. Run "shopify theme component map" to update the component.manifest.json file.`);
    }

    const copyManifestFiles = (fileType: 'assets' | 'snippets') => {
      for (const [fileName, fileCollection] of Object.entries(manifest.files[fileType])) {
        if (fileCollection === collectionName) {
          const node = componentNodes.find(node => node.name === fileName && node.themeFolder === fileType);
          if (node) {
            const src = node.file;
            const dest = path.join(themeDir, fileType, fileName);
            copyFileIfChanged(src, dest);
          }
        }
      }
    };

    copyManifestFiles('snippets');
    copyManifestFiles('assets');
  }
}
