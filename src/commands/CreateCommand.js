// Node.js Imports
import { exec } from 'node:child_process'
import { access, constants, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

// Internal Imports
import Session from '../models/static/Session.js'
import Components from '../config/Components.js'
import FileAccessError from '../errors/FileAccessError.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'
import NodeUtils from '../utils/NodeUtils.js'

class CreateCommand {
  /**
   * Execute The CLI's Create Command
   * @param {Object} packageManifest - package.json contents
   * @returns {Promise<ChildProcess>}
   */
  static async execute (packageManifest) {
    const workspaceFolder = Components.SNIPPETS_FOLDER_NAME
    const componentFolder = join(workspaceFolder, Session.targetName)
    const componentRootFolder = join(NodeUtils.getPackageRootFolder(), componentFolder)

    logger.info(`Creating "${Session.targetName}" ${Session.targetType}`)

    // Exit if the folder already exists
    let folderExists = false
    try {
      // This will throw an error if the folder doesn't exist.
      await access(componentRootFolder, constants.X_OK)
      // This only run if the previous "access" call was successful, proving the folder already exists
      folderExists = true
    } catch {
      // An error is expected since the folder shouldn't exist
    }

    // Don't overwrite an existing component, throw an error
    if (folderExists) {
      throw new FileAccessError(`The "${Session.targetName}" ${Session.targetType} folder already exists. Please remove it or choose a different name.`)
    }

    const cliRootFolder = NodeUtils.getCLIRootFolderName()
    const componentSources = join(cliRootFolder, 'resources/component-files')

    const packageScope = NodeUtils.getPackageScope()
    const packageScopeName = packageScope.charAt(0) === '@' ? packageScope.substring(1) : packageScope
    const packageName = NodeUtils.getPackageName()
    const copyFolderOptions = {
      recursive: true,
      jsTemplateVariables: {
        author: packageManifest.author ? packageManifest.author : 'Archetype Themes Limited Partnership',
        collectionName: packageName,
        collectionScope: packageScope,
        componentName: Session.targetName,
        componentType: Session.targetType,
        componentFolder: `${workspaceFolder}/${Session.targetName}`,
        gitUrl: `https://github.com/${packageScopeName}/${packageName}.git`,
        license: packageManifest.license ? packageManifest.license : 'UNLICENSED',
        packageName: `${packageScope}/${Session.targetName}-${Session.targetType}`
      }
    }

    // Copy files recursively
    await mkdir(componentRootFolder)
    await FileUtils.copyFolder(componentSources, componentRootFolder, copyFolderOptions)

    // Run npm install; this must be done or npm will send error messages relating to monorepo integrity
    return exec('npm install', { cwd: componentRootFolder })
  }
}

export default CreateCommand
