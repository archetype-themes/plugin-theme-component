// Node JS imports
import { join } from 'path'

// Archie imports
import SectionFactory from './SectionFactory.js'
import NodeConfig from '../cli/models/NodeConfig.js'
import FileAccessError from '../errors/FileAccessError.js'
import Collection from '../models/Collection.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import logger from '../utils/Logger.js'
import Components from '../config/Components.js'

class CollectionFactory {
  /**
   * From Collection Build Script
   * @param {string} collectionName - Collection name
   * @return {Promise<Collection>}
   */
  static async fromName (collectionName) {
    const collection = new Collection()

    // Set Collection name
    collection.name = collectionName

    // Set folder names
    collection.rootFolder = await CollectionUtils.findRootFolder(collectionName)
    collection.sectionsFolder = join(collection.rootFolder, Components.COLLECTION_SECTIONS_FOLDER)

    // Get Section Names and create Sections
    collection.sectionNames = await this.getSectionNames(collection.name, collection.sectionsFolder)
    collection.sections = await SectionFactory.fromCollection(collection.sectionNames, collection.rootFolder)

    return collection
  }

  /**
   * @param {string} collectionName
   * @param {string} sectionsFolder
   * @return {Promise<string[]>}
   */
  static async getSectionNames (collectionName, sectionsFolder) {
    let sectionNames = NodeConfig.getCollectionSections(collectionName)

    if (sectionNames.length === 0) {
      if (NodeConfig.isTheme()) {
        logger.warn('No section list found for Collection; all sections will be processed.')
      }

      try {
        sectionNames = await CollectionUtils.findSectionNames(sectionsFolder)
      } catch (error) {
        throw new FileAccessError(`Couldn't find or access sections for the ${collectionName} collection on disk. Please verify your install and file permissions.`)
      }
    }
    return sectionNames
  }
}

export default CollectionFactory
