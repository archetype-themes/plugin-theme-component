// Node Modules import
import chokidar from 'chokidar'
// Archie imports
import CollectionBuilder from '../builders/CollectionBuilder.js'
import CollectionFactory from '../factory/CollectionFactory.js'
import logger from '../utils/Logger.js'
import SectionFactory from '../factory/SectionFactory.js'

class CollectionWatcher {
  /**
   * Build Collection on File Change
   * @param {string} collectionRootFolder
   */
  static async buildOnChange (collectionRootFolder) {
    const watcher = this.getChokidarCollectionWatcher(collectionRootFolder)

    watcher.on('all', async (event, path) => {
      logger.debug(`Event: "${event}" on file: ${path} detected`)

      const collection = await CollectionFactory.fromCollectionBuildCommand()
      collection.sections = await SectionFactory.fromCollection(collection)
      return CollectionBuilder.build(collection)
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
