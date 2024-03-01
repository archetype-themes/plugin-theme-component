// External Dependencies
import { basename } from 'node:path'
import { ux } from '@oclif/core'

// Internal Dependencies
import Collection from '../models/Collection.js'
import Session from '../models/static/Session.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import { getAbsolutePath } from '../utils/FileUtils.js'
import { getPackageManifest, getPackageName } from '../utils/NodeUtils.js'
import { isRepoUrl } from '../utils/WebUtils.js'

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
    collection.rootFolder = await CollectionUtils.getRootFolder(collectionName, collectionSource)

    // Get Component Names and Create Them
    if (componentNames?.length) {
      collection.componentNames = componentNames
    } else if (Session.isTheme()) {
      ux.warn(`No component list found for the "${collection.name}" collection; all components will be installed.`)
    }

    return CollectionUtils.initCollectionFiles(collection)
  }

  /**
   *
   * @param {string} source
   * @param {string[]|null} componentNames
   * @return {module:models/Collection}
   */
  static async fromInstallCommand (source, componentNames) {
    const collection = new Collection()
    collection.source = source
    collection.componentNames = componentNames

    if (isRepoUrl(collection.source)) {
      collection.name = basename(collection.source)
      if (collection.name.endsWith('.git')) {
        collection.name = collection.name.slice(0, -4)
      }
      collection.rootFolder = await CollectionUtils.getRootFolder(collection.name, collection.source)
    } else {
      collection.rootFolder = await getAbsolutePath(collection.source)
      try {
        const packageManifest = await getPackageManifest(collection.rootFolder)
        collection.name = getPackageName(packageManifest)
      } catch (error) {
        // Fallback on folder name if we don't have a package name
        collection.name = basename(collection.source)
      }
    }

    return collection
  }
}

export default CollectionFactory
