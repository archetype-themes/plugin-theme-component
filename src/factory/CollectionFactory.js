// External Dependencies
import { basename } from 'node:path'

// Internal Dependencies
import Collection from '../models/Collection.js'
import { initComponents } from '../utils/CollectionUtils.js'
import { getPackageManifest, getPackageName } from '../utils/NodeUtils.js'
import { cwd } from 'node:process'

class CollectionFactory {
  /**
   * Create Collection Model From CWD (Current Working Directory)
   * @param {string[]} [componentNames] - List of Components To Bundle With The Collection
   * @return {Promise<module:models/Collection>}
   */
  static async fromCwd(componentNames) {
    return CollectionFactory.fromPath(cwd(), componentNames)
  }

  /**
   * Create Collection Model From A Remote Path
   * This will attempt to download a copy of a remote repository if the path is not local
   * @param {string} path
   * @param {string[]} [componentNames]
   * @return {module:models/Collection}
   */
  static async fromPath(path, componentNames) {
    const collection = new Collection()
    collection.rootFolder = path
    console.log('CRF', collection.rootFolder)

    try {
      const packageManifest = await getPackageManifest(collection.rootFolder)
      console.log(packageManifest)
      collection.name = getPackageName(packageManifest)
    } catch (error) {
      // Fallback on folder name if we don't have a package name
      collection.name = basename(collection.source)
    }

    if (componentNames?.length) {
      collection.componentNames = componentNames
    }

    return initComponents(collection)
  }
}

export default CollectionFactory
