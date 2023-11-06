// Node.js imports
import { join } from 'node:path'

// Internal Imports
import Collection from '../models/Collection.js'
import Session from '../models/static/Session.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'

class CollectionFactory {
  /**
   * From Collection Build Script
   * @param {string} collectionName - Collection Name
   * @param {string[]} componentNames - List of Components To Bundle With The Collection
   * @return {Promise<module:models/Collection>}
   */
  static async fromName (collectionName, componentNames) {
    const collection = new Collection()

    // Set Collection name
    collection.name = collectionName

    // Set Folder Names
    collection.rootFolder = await CollectionUtils.findRootFolder(collectionName)

    // Find .gitignore File
    const gitignoreFile = join(collection.rootFolder, '.gitignore')
    if (await FileUtils.exists(gitignoreFile)) {
      collection.gitIgnoreFile = gitignoreFile
    }

    // Recursively Find All package.json Files
    collection.packageJsonFiles = await FileUtils.searchFile(collection.rootFolder, 'package.json', true)

    // Create Components From package.json Files Data
    const workspaceFolders = await CollectionUtils.getWorkspaceFolders(collection.rootFolder)
    collection.components = await CollectionUtils.findComponents(collection.packageJsonFiles, [...workspaceFolders, collection.rootFolder])

    // Get Component Names and Create Them
    if (componentNames && componentNames.length) {
      collection.componentNames = componentNames
    } else if (Session.isTheme()) {
      logger.warn(`No component list found for the "${collectionName}" collection; all components will be installed.`)
    }

    return collection
  }
}

export default CollectionFactory
