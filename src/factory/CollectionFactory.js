// Node JS imports
import { join } from 'path'

// Archie imports
import SectionFactory from './SectionFactory.js'
import ArchieNodeConfig from '../cli/models/ArchieNodeConfig.js'
import FileAccessError from '../errors/FileAccessError.js'
import Collection from '../models/Collection.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import logger from '../utils/Logger.js'

class CollectionFactory {
  /**
   * From Collection Build Script
   * @param {string} collectionName - Collection name
   * @param {string} rootFolder - Collection root folder
   * @return {Promise<Collection>}
   */
  static async fromNameAndFolder (collectionName, rootFolder) {
    const collection = new Collection()

    // Set Collection name
    collection.name = collectionName

    // Set folder names
    collection.rootFolder = rootFolder
    collection.sectionsFolder = join(collection.rootFolder, Collection.SECTIONS_SUB_FOLDER)

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

    let sectionNames = ArchieNodeConfig.getCollectionSections(collectionName)

    if (sectionNames.length === 0) {
      logger.info(`No section list found for Collection; all sections will be processed.`)
      try {
        sectionNames = await CollectionUtils.findSectionNames(sectionsFolder)
      } catch (error) {
        throw new FileAccessError(`Couldn't find the ${collectionName} collection on disk. Is it installed?`)
      }
    }
    return sectionNames
  }
}

export default CollectionFactory
