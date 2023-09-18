// Node JS imports
import { join } from 'path'

// Archie imports
import CLISession from '../../cli/models/CLISession.js'
import Collection from '../models/Collection.js'
import CollectionUtils from '../../utils/CollectionUtils.js'
import Components from '../../config/Components.js'
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
    collection.sectionsFolder = join(collection.rootFolder, Components.COLLECTION_SECTIONS_FOLDER)

    // Get Section Names and create Sections
    collection.sectionNames = await this.#findComponentNames(collection.name, collection.sectionsFolder, componentNames)
    collection.sections = await SectionFactory.fromCollection(collection.sectionNames, collection.rootFolder)

    return collection
  }

  /**
   * Get Component Names
   * Returns the Archie collection item's inner components' list from package.json. Defaults to all components if empty.
   * @param {string} collectionName
   * @param {string} sectionsFolder
   * @param {string[]} componentNames
   * @return {Promise<string[]>}
   */
  static async #findComponentNames (collectionName, sectionsFolder, componentNames) {
    if (!componentNames || componentNames.length === 0) {
      if (CLISession.isTheme()) {
        logger.warn('No section list found for Collection; all sections will be processed.')
      }

      try {
        return await CollectionUtils.findSectionNames(sectionsFolder)
      } catch (error) {
        throw new FileAccessError(`Couldn't find or access sections for the ${collectionName} collection on disk. Please verify your install and file permissions.`)
      }
    }
  }
}

export default CollectionFactory
