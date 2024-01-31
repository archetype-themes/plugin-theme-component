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
   * @param {string[]} [componentNames] - List of Components To Bundle With The Collection
   * @param {string} [collectionSource] - Collection Source Path or URL
   * @return {Promise<module:models/Collection>}
   */
  static async fromName (collectionName, componentNames, collectionSource) {
    const collection = new Collection()

    collection.name = collectionName
    if (collectionSource) { collection.source = collectionSource }
    collection.rootFolder = await CollectionUtils.findRootFolder(collectionName, collectionSource)

    // Find .gitignore File
    const gitignoreFile = join(collection.rootFolder, '.gitignore')
    if (await FileUtils.exists(gitignoreFile)) {
      collection.gitIgnoreFile = gitignoreFile
    }

    // Find All component Folders
    const componentFolders = await CollectionUtils.getComponentFolders(collection.rootFolder)

    // Create Components From components Folders
    collection.components = CollectionUtils.findComponents(componentFolders)

    // Get Component Names and Create Them
    if (componentNames?.length) {
      collection.componentNames = componentNames
    } else if (Session.isTheme()) {
      logger.warn(`No component list found for the "${collectionName}" collection; all components will be installed.`)
    }

    return collection
  }

  /**
   * Create a collection from a Toml Entry
   * @param {Array} collectionEntry
   * @return {Promise<module:models/Collection>}
   */
  static async fromTomlEntry (collectionEntry) {
    return await this.fromName(collectionEntry[0], collectionEntry[1].components, collectionEntry[1].source)
  }
}

export default CollectionFactory
