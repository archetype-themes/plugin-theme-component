/**
 * This command generates or updates a component.manifest.json file
 *
 * - Updates component files (assets and snippets) mapping
 * - Updates component collection details
 */

import fs from 'node:fs'
import path from 'node:path'

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import Flags from '../../../utilities/flags.js'
import { getLastCommitHash } from '../../../utilities/git.js'
import { ManifestOptions, generateManifestFiles, getManifest } from '../../../utilities/manifest.js'
import { sortObjectKeys } from '../../../utilities/objects.js'
import { getNameFromPackageJson, getVersionFromPackageJson } from '../../../utilities/package-json.js'

export default class Manifest extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.THEME_DIR,
    Args.COMPONENT_SELECTOR
  ])

  static override description = 'Generates or updates a component.manifest.json file with the component collection details and a file map'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory',
    '<%= config.bin %> <%= command.id %> theme-directory header',
    '<%= config.bin %> <%= command.id %> theme-directory header,footer,navigation'
  ]

  static override flags = Flags.getDefinitions([
    Flags.COLLECTION_NAME,
    Flags.COLLECTION_VERSION,
    Flags.IGNORE_CONFLICTS,
    Flags.IGNORE_OVERRIDES
  ])

  protected override async init(): Promise<void> {
    await super.init(Manifest)
  }

  public async run(): Promise<void> {
    const currentDir = process.cwd()
    const hasPackageJson = fs.existsSync(path.join(currentDir, 'package.json'))
    const hasComponentsDir = fs.existsSync(path.join(currentDir, 'components'))

    if (!hasPackageJson || !hasComponentsDir) {
      this.error('Warning: Current directory does not appear to be a component collection. Expected to find package.json and components directory.')
    }

    const themeDir = path.resolve(currentDir, this.args[Args.THEME_DIR])
    const collectionDir = currentDir
    const collectionName = this.flags[Flags.COLLECTION_NAME] || getNameFromPackageJson(process.cwd())
    const collectionVersion = this.flags[Flags.COLLECTION_VERSION] || getVersionFromPackageJson(process.cwd())
    const ignoreConflicts = this.flags[Flags.IGNORE_CONFLICTS]
    const ignoreOverrides = this.flags[Flags.IGNORE_OVERRIDES]
    const componentSelector = this.args[Args.COMPONENT_SELECTOR]

    const manifestPath = path.join(themeDir, 'component.manifest.json')
    const manifest = getManifest(manifestPath);

    const options: ManifestOptions = {
      componentSelector,
      ignoreConflicts,
      ignoreOverrides
    }

    const files = await generateManifestFiles(
      manifest.files,
      themeDir,
      collectionDir,
      collectionName,
      options
    )

    manifest.files = sortObjectKeys(files)
    manifest.collections[collectionName] = {
      commit: getLastCommitHash(collectionDir),
      version: collectionVersion
    }

    fs.writeFileSync(manifestPath, JSON.stringify(sortObjectKeys(manifest), null, 2))
  }
}
