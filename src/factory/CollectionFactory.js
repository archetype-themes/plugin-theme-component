// Node.js imports
// Archie imports
import Collection from '../models/Collection.js'
import Session from '../models/static/Session.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'

class CollectionFactory {
  /**
   * From Collection Build Script
   * @param {string} collectionName - Collection name
   * @param {string[]} componentNames - List of Components to build as part of the Collection
   * @return {Promise<module:models/Collection>}
   */
  static async fromName (collectionName, componentNames) {
    const collection = new Collection()

    // Set Collection name
    collection.name = collectionName

    // Set folder names
    collection.rootFolder = await CollectionUtils.findRootFolder(collectionName)

    // Recursively find all package.json files
    collection.packageJsonFiles = await FileUtils.searchFile(collection.rootFolder, 'package.json', true)

    // Create Components and Sections from package.json files data
    const [components, sections, snippets] = await CollectionUtils.findComponentsFromPackageJsonFiles(collection.packageJsonFiles)

    collection.components = components
    collection.sections = sections
    collection.snippets = snippets

    // Get Section Names and create Sections
    if (componentNames && componentNames.length) {
      collection.sectionNames = componentNames
    } else if (Session.isTheme()) {
      logger.warn(`No component list found for the "${collectionName}" collection; all components will be installed.`)
    }

    return collection
  }
}

export default CollectionFactory
