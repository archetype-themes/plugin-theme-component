import Collection from '../models/Collection.js'
import { env } from 'node:process'
import { dirname, join } from 'path'
import BuildFactory from './BuildFactory.js'
import SectionFactory from './SectionFactory.js'
import ArchieComponents from '../config/ArchieComponents.js'
import ArchieNodeConfig from '../models/static/ArchieNodeConfig.js'
import logger from '../utils/Logger.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import NodeUtils from '../utils/NodeUtils.js'

class CollectionFactory {
  /**
   * From Collection Build Script
   * @return {Promise<Collection>}
   */
  static async fromCollectionBuildCommand () {

    const collection = new Collection()

    collection.name = NodeUtils.getPackageName()
    // Set folder names
    collection.rootFolder = dirname(env.npm_package_json)
    collection.sectionsFolder = join(collection.rootFolder, ArchieComponents.COLLECTION_SECTIONS_SUB_FOLDER)

    // Prepare build object
    collection.build = BuildFactory.fromCollection(collection)

    // Fetch Section Names
    collection.sectionNames = ArchieNodeConfig.getCollectionSections(collection.name)

    if (collection.sectionNames.length === 0) {
      logger.info(`No section list found for ${collection.name}; all sections will be processed.`)
      await CollectionUtils.findSectionNames(collection)
    }

    // Create sections
    for (const sectionName of collection.sectionNames) {
      const section = await SectionFactory.fromName(sectionName)
      collection.sections.push(section)
    }

    return collection
  }

  /**
   *
   * @param {string} collectionName
   * @return {Promise<Collection>}
   */
  static async fromThemeInstallCommand (collectionName) {
    const collection = new Collection()

    collection.name = collectionName
    //Folders
    collection.rootFolder = join(dirname(env.npm_package_json), 'node_modules', ArchieComponents.DEFAULT_PACKAGE_SCOPE, collection.name)
    collection.sectionsFolder = join(collection.rootFolder, ArchieComponents.COLLECTION_SECTIONS_SUB_FOLDER)

    // Prepare build object
    collection.build = BuildFactory.fromCollection(collection)

    // Fetch Section Names
    collection.sectionNames = ArchieNodeConfig.getCollectionSections(collection.name)

    if (collection.sectionNames.length === 0) {
      logger.info(`No section list found for ${collection.name}; all sections will be processed.`)
      try {
        await CollectionUtils.findSectionNames(collection)
      } catch (error) {
        throw new Error(`Couldn't find the ${collection.name} collection on disk. Is it installed?`)
      }

    }

    // Create sections
    for (const sectionName of collection.sectionNames) {
      const section = await SectionFactory.fromSectionBuildCommand(sectionName)
      collection.sections.push(section)
    }

    return collection
  }

}

export default CollectionFactory
