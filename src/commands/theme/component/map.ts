/**
 * This command generates or updates a component-map.json file
 * 
 * - Updates component files (assets and snippets) mapping
 * - Updates component collection details
 */

import path from 'path'
import fs from 'node:fs'

import Args from '../../../utilities/args.js'    
import BaseCommand from '../../../utilities/base-command.js'
import Flags from '../../../utilities/flags.js'
import { getComponentMap, generateComponentFilesMap } from '../../../utilities/component-map.js'
import { getNameFromPackageJson, getVersionFromPackageJson } from '../../../utilities/package-json.js'

export default class ComponentMap extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.THEME_DIR,
    Args.COMPONENT_SELECTOR
  ])

  static override description = 'Generates or updates a shopify.theme.json file with the component collection details and a snippets import map'

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
    await super.init(ComponentMap)
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

    const componentMapPath = path.join(themeDir, 'component-map.json')
    const componentMap = getComponentMap(componentMapPath);

    const files = generateComponentFilesMap(
      componentMap.files, 
      themeDir, 
      collectionDir, 
      collectionName,
      ignoreConflicts,
      ignoreOverrides
    )

    componentMap.files = sortObjectKeys(files)
    componentMap.collections[collectionName] = componentMap.collections[collectionName] || {}
    componentMap.collections[collectionName].version = collectionVersion

    fs.writeFileSync(componentMapPath, JSON.stringify(sortObjectKeys(componentMap), null, 2))
  }
}

function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((result, key) => {
      result[key] = sortObjectKeys(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}
