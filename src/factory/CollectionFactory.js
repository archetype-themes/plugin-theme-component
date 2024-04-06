// External Dependencies
import { basename, join } from 'node:path'

// Internal Dependencies
import Collection from '../models/Collection.js'
import { initComponents } from '../utils/CollectionUtils.js'
import { getAbsolutePath } from '../utils/FileUtils.js'
import { getPackageManifest, getPackageName } from '../utils/NodeUtils.js'
import { isGitHubUrl } from '../utils/WebUtils.js'
import { cwd } from 'node:process'
import { COLLECTIONS_INSTALL_FOLDER_NAME } from '../config/CLI.js'
import { installComponents } from '../utils/ExternalComponentUtils.js'
import Session from '../models/static/Session.js'

class CollectionFactory {
  /**
   * Create Collection Model From CWD (Current Working Directory)
   * @param {string[]} [componentNames] - List of Components To Bundle With The Collection
   * @return {Promise<module:models/Collection>}
   */
  static async fromCwd(componentNames) {
    const collection = new Collection()

    collection.rootFolder = cwd()
    collection.name = basename(collection.rootFolder)

    // Get Component Names and Create Them
    if (componentNames?.length) {
      collection.componentNames = componentNames
    }

    return initComponents(collection)
  }

  /**
   * Create Collection Model From A Remote Path
   * This will attempt to download a copy of a remote repository if the path is not local
   * @param {string} remotePath
   * @param {string[]} [componentNames]
   * @return {module:models/Collection}
   */
  static async fromRemotePath(remotePath, componentNames) {
    const collection = new Collection()
    collection.source = remotePath
    collection.componentNames = componentNames

    if (isGitHubUrl(collection.source)) {
      collection.name = basename(collection.source, '.git')
      collection.rootFolder = join(cwd(), COLLECTIONS_INSTALL_FOLDER_NAME, collection.name)
      // Install Components Collection locally and change components path in the Session
      await installComponents(collection.source, collection.rootFolder)
      Session.componentsPath = collection.rootFolder
    } else {
      collection.rootFolder = getAbsolutePath(collection.source)
      try {
        const packageManifest = await getPackageManifest(collection.rootFolder)
        collection.name = getPackageName(packageManifest)
      } catch (error) {
        // Fallback on folder name if we don't have a package name
        collection.name = basename(collection.source)
      }
    }

    return initComponents(collection)
  }
}

export default CollectionFactory
