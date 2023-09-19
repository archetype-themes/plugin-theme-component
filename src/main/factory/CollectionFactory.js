// Archie imports
import CLISession from '../../cli/models/CLISession.js'
import NodeUtils from '../../utils/NodeUtils.js'
import Collection from '../models/Collection.js'
import CollectionUtils from '../../utils/CollectionUtils.js'
import FileAccessError from '../../errors/FileAccessError.js'
import SectionFactory from './SectionFactory.js'
import logger from '../../utils/Logger.js'

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

    if (CLISession.archieConfig.componentFolders) {
      if (Array.isArray(CLISession.archieConfig.componentFolders)) {
        collection.componentsFolders = CLISession.archieConfig.componentFolders
      } else if (NodeUtils.isString(CLISession.archieConfig.componentFolders)) {
        collection.componentsFolders = [CLISession.archieConfig.componentFolders]
      }
    } else {
      collection.componentsFolders = await CollectionUtils.findComponentFolders(collection.rootFolder)
    }

    // Get Section Names and create Sections
    if (componentNames && componentNames.length) {
      collection.sectionNames = componentNames
    } else {
      if (CLISession.isTheme()) {
        logger.warn(`No component list found for the "${collectionName}" collection; all components will be installed.`)
      }
      try {
        collection.sectionNames = await CollectionUtils.findComponentNames(collection.componentsFolders)
      } catch (error) {
        throw new FileAccessError(`Couldn't find or access components for the "${collectionName}" collection on disk. Please verify your install and file permissions.`)
      }
    }

    collection.sections = await SectionFactory.fromCollection(collection.sectionNames, collection.rootFolder)

    return collection
  }
}

export default CollectionFactory
