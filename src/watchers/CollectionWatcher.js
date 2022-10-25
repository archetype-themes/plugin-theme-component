// Node Modules import
import chokidar from 'chokidar'
// Archie imports
import CollectionBuilder from '../builders/CollectionBuilder.js'
import CollectionFactory from '../factory/CollectionFactory.js'
import ThemeFactory from '../factory/ThemeFactory.js'
import Archie from '../models/static/Archie.js'
import logger from '../utils/Logger.js'

import CollectionInstaller from '../Installers/CollectionInstaller.js'

class CollectionWatcher {
  /**
   * Build Collection on File Change
   * @param {string} collectionRootFolder
   */
  static async buildOnChange (collectionRootFolder) {
    const watcher = this.getChokidarCollectionWatcher(collectionRootFolder)

    watcher.on('all', async (event, path) => {
      logger.debug(`Event: "${event}" on file: ${path} detected`)

      const collection = await CollectionFactory.fromArchieCall()
      return CollectionBuilder.build(collection)
    })
  }

  /**
   * Build and Install Collection in Current Theme on File Change
   * @param {string} collectionRootFolder
   * @return {Promise<void>}
   */
  static async installOnChange (collectionRootFolder) {
    const watcher = this.getChokidarCollectionWatcher(collectionRootFolder)

    watcher.on('all', async (event, path) => {
      logger.debug(`Event: "${event}" on file: ${path} detected`)

      const collection = await CollectionFactory.fromName(Archie.targetComponent)
      const theme = await ThemeFactory.fromArchieCall()
      await CollectionBuilder.build(collection)
      return CollectionInstaller.install(collection, theme)
    })

  }

  /**
   * Get Chokidar Collection Watcher
   * @param {string} collectionRootFolder
   * @return {FSWatcher}
   */
  static getChokidarCollectionWatcher (collectionRootFolder) {
    return chokidar.watch(['sections/*/src/*', 'snippets/*/src/*'], {
      awaitWriteFinish: {
        pollInterval: 10,
        stabilityThreshold: 50
      },
      cwd: collectionRootFolder,
      ignoreInitial: true
    })
  }
}

export default CollectionWatcher
