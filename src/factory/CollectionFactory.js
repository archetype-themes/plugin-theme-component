import Collection from '../models/Collection.js'
import { env } from 'node:process'
import { dirname, join } from 'path'
import Config from '../models/static/Config.js'
import BuildFactory from './BuildFactory.js'
import SectionFactory from './SectionFactory.js'
import logger from '../utils/Logger.js'
import CollectionUtils from '../utils/CollectionUtils.js'

class CollectionFactory {
  /**
   * From Collection Build Script
   * @return {Promise<Collection>}
   */
  static async fromArchieCall () {

    const collection = new Collection()

    collection.name = env.npm_package_name.includes('/') ? env.npm_package_name.split('/')[1] : env.npm_package_name
    // Set folder names
    collection.rootFolder = dirname(env.npm_package_json)
    collection.sectionsFolder = join(collection.rootFolder, Config.COLLECTION_SECTIONS_SUBFOLDER)

    // Prepare build object
    collection.build = BuildFactory.fromCollection(collection)

    // Fetch Section Names
    collection.sectionNames = await Config.getSectionsList(collection.name)

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
  static async fromName (collectionName) {
    const collection = new Collection()

    collection.name = collectionName
    //Folders
    collection.rootFolder = join(dirname(env.npm_package_json), 'node_modules', Config.PACKAGES_SCOPE, collection.name)
    collection.sectionsFolder = join(collection.rootFolder, Config.COLLECTION_SECTIONS_SUBFOLDER)

    // Prepare build object
    collection.build = BuildFactory.fromCollection(collection)

    // Fetch Section Names
    collection.sectionNames = await Config.getSectionsList(collection.name)

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
      const section = await SectionFactory.fromName(sectionName)
      collection.sections.push(section)
    }

    return collection
  }

}

export default CollectionFactory
