// Internal Imports
import Collection from '../models/Collection.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import Session from '../models/static/Session.js'
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

    // Get Component Names and Create Them
    if (componentNames?.length) {
      collection.componentNames = componentNames
    } else if (Session.isTheme()) {
      logger.warn(`No component list found for the "${collection.name}" collection; all components will be installed.`)
    }

    return CollectionUtils.initCollectionFiles(collection)
  }

  /**
   * Create a collection from a Toml Entry
   * @param {Array} collectionEntry
   * @return {Promise<module:models/Collection>}
   */
  static async fromTomlEntry (collectionEntry) {
    const collection = new Collection()
    collection.name = collectionEntry[0]
    if (collectionEntry[1].source) { collection.source = collectionEntry[1].source }
    collection.rootFolder = await CollectionUtils.findRootFolder(collection.name, collection.source)

    // Get Component Names and Create Them
    if (collectionEntry[1].components?.length) {
      collection.componentNames = collectionEntry[1].components
    } else if (Session.isTheme()) {
      logger.warn(`No component list found for the "${collection.name}" collection; all components will be installed.`)
    }

    return Promise.resolve(collection)
  }
}

export default CollectionFactory
