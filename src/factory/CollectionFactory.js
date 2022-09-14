import Collection from '../models/Collection.js'
import { env } from 'node:process'
import { dirname, join } from 'path'
import Config from '../Config.js'

class CollectionFactory {
  /**
   * From Collection Build Script
   * @return {Promise<Collection>}
   */
  static async fromBuildScript () {

    const collection = new Collection()

    collection.name = env.npm_package_name.includes('/') ? env.npm_package_name.split('/')[1] : env.npm_package_name
    collection.rootFolder = dirname(env.npm_package_json)

    collection.sectionsFolder = join(collection.rootFolder, Config.COLLECTION_SECTIONS_SUBFOLDER)

    collection.sectionNames = await Config.getSectionsList(collection.name)

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
    collection.rootFolder = join(dirname(env.npm_package_json), 'node_modules', Config.PACKAGES_SCOPE, collection.name)

    collection.sectionsFolder = join(collection.rootFolder, Config.COLLECTION_SECTIONS_SUBFOLDER)

    collection.sectionNames = await Config.getSectionsList(collection.name)

    return collection
  }

}

export default CollectionFactory
