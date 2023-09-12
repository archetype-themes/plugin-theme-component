// Node.js Imports
import { exec } from 'node:child_process'
import { access, constants, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

// Archie Imports
import Components from '../../config/Components.js'
import FileAccessError from '../../errors/FileAccessError.js'
import FileUtils from '../../utils/FileUtils.js'
import logger from '../../utils/Logger.js'
import NodeUtils from '../../utils/NodeUtils.js'

class CreateCommand {
  /**
   * Execute Archie's CLI Create Command
   * @param {CLISession} session
   * @param {Object} packageManifest
   * @returns {Promise<ChildProcess>}
   */
  static async execute (session, packageManifest) {
    const workspaceFolder = (session.commandOption === Components.SECTION_COMPONENT_NAME) ? Components.COLLECTION_SECTIONS_FOLDER : Components.COLLECTION_SNIPPETS_FOLDER
    const componentFolder = join(workspaceFolder, session.targetComponentName)
    const componentRootFolder = join(NodeUtils.getPackageRootFolder(), componentFolder)

    logger.info(`Creating "${session.targetComponentName}" ${session.commandOption}`)

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
      throw new FileAccessError(`The "${session.targetComponentName}" ${session.commandOption} folder already exists. Please remove it or choose a different name.`)
    }

    const archieRootFolder = NodeUtils.getArchieRootFolderName()
    const componentSources = join(archieRootFolder, 'resources/component-files')
    const sectionSources = join(archieRootFolder, 'resources/section-files')

    const packageScope = NodeUtils.getPackageScope()
    const packageScopeName = packageScope.charAt(0) === '@' ? packageScope.substring(1) : packageScope
    const packageName = NodeUtils.getPackageName()
    const copyFolderOptions = {
      recursive: true,
      jsTemplateVariables: {
        author: packageManifest.author ? packageManifest.author : 'Archetype Themes Limited Partnership',
        collectionName: packageName,
        collectionScope: packageScope,
        componentName: session.targetComponentName,
        componentType: session.commandOption,
        componentFolder: `${workspaceFolder}/${session.targetComponentName}`,
        gitUrl: `https://github.com/${packageScopeName}/${packageName}.git`,
        license: packageManifest.license ? packageManifest.license : 'UNLICENSED',
        packageName: `${packageScope}/${session.targetComponentName}-${session.commandOption}`
      }
    }

    // Copy files recursively
    await mkdir(componentRootFolder)
    await FileUtils.copyFolder(componentSources, componentRootFolder, copyFolderOptions)
    await FileUtils.copyFolder(sectionSources, componentRootFolder, copyFolderOptions)

    // Run npm install; this must be done or npm will send error messages relating to monorepo integrity
    return exec('npm install', { cwd: componentRootFolder })
  }
}

export default CreateCommand
