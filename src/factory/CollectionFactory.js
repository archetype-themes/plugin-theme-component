import Collection from '../models/Collection.js'
import { env } from 'node:process'
import { dirname, join } from 'path'
import BuildFactory from './BuildFactory.js'
import ArchieNodeConfig from '../cli/models/ArchieNodeConfig.js'
import logger from '../utils/Logger.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import NodeUtils from '../utils/NodeUtils.js'
import ThemeUtils from '../utils/ThemeUtils.js'

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
    collection.sectionsFolder = join(collection.rootFolder, Collection.SECTIONS_SUB_FOLDER)

    // Prepare build object
    collection.build = BuildFactory.fromCollection(collection)

    // Fetch Section Names
    collection.sectionNames = ArchieNodeConfig.getCollectionSections(collection.name)

    if (collection.sectionNames.length === 0) {
      logger.info(`No section list found for ${collection.name}; all sections will be processed.`)
      await CollectionUtils.findSectionNames(collection)
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
    collection.rootFolder = await ThemeUtils.findCollectionPackageRootFolder(collection.name)
    collection.sectionsFolder = join(collection.rootFolder, Collection.SECTIONS_SUB_FOLDER)

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

    return collection
  }

}

export default CollectionFactory
