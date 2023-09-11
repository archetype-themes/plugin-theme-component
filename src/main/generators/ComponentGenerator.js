// Node.js internal imports
import { exec } from 'child_process'
import { access, constants, mkdir } from 'node:fs/promises'
import path from 'path'

// Archie imports
import Components from '../../config/Components.js'
import FileAccessError from '../../errors/FileAccessError.js'
import FileUtils from '../../utils/FileUtils.js'
import logger from '../../utils/Logger.js'
import NodeUtils from '../../utils/NodeUtils.js'

/**
 * This callback is displayed as part of the Requester class.
 * @type{function} execPromise
 * @param {number} responseCode
 * @param {string} responseMessage
 */

class ComponentGenerator {
  /**
   * Generate Section
   * @param {string} componentName
   * @param {string} componentType
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async generate (componentName, componentType) {
    const workspaceFolder = (componentType === Components.SECTION_COMPONENT_NAME) ? Components.COLLECTION_SECTIONS_FOLDER : Components.COLLECTION_SNIPPETS_FOLDER
    const componentFolder = path.join(workspaceFolder, componentName)
    const componentRootFolder = path.join(NodeUtils.getPackageRootFolder(), componentFolder)

    logger.info(`Creating "${componentName}" ${componentType}`)

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

    // Don't overwrite an existing section, throw an error
    if (folderExists) {
      throw new FileAccessError(`The "${componentName}" ${componentType} folder already exists. Please remove it or choose a different name.`)
    }

    const archieRootFolder = NodeUtils.getArchieRootFolderName()
    const componentSources = path.join(archieRootFolder, 'resources/component-files')
    const sectionSources = path.join(archieRootFolder, 'resources/section-files')

    const packageManifest = await NodeUtils.getPackageManifest()

    const packageScope = NodeUtils.getPackageScope()
    const packageScopeName = packageScope.charAt(0) === '@' ? packageScope.substring(1) : packageScope
    const packageName = NodeUtils.getPackageName()
    const copyFolderOptions = {
      recursive: true,
      jsTemplateVariables: {
        author: packageManifest.author ? packageManifest.author : 'Archetype Themes Limited Partnership',
        collectionName: packageName,
        collectionScope: packageScope,
        componentName,
        componentType,
        componentFolder: `${workspaceFolder}/${componentName}`,
        gitUrl: `https://github.com/${packageScopeName}/${packageName}.git`,
        license: packageManifest.license ? packageManifest.license : 'UNLICENSED',
        packageName: `${packageScope}/${componentName}-${componentType}`
      }
    }

    // Copy files recursively
    await mkdir(componentRootFolder)
    await FileUtils.copyFolder(componentSources, componentRootFolder, copyFolderOptions)
    await FileUtils.copyFolder(sectionSources, componentRootFolder, copyFolderOptions)

    // Run npm install; this must be done or npm will send error messages relating to monorepo integrity
    exec('npm install', { cwd: componentRootFolder })
  }
}

export default ComponentGenerator
