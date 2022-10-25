import chokidar from 'chokidar'
import CollectionFactory from '../factory/CollectionFactory.js'
import CollectionBuilder from '../builders/CollectionBuilder.js'
import logger from '../utils/Logger.js'

class CollectionWatcher {
  /**
   *
   * @param {Collection} collection
   */
  static async watch (collection) {
    const watcher = chokidar.watch(['sections/*/src/*', 'snippets/*/src/*'], {
      awaitWriteFinish: {
        pollInterval: 20,
        stabilityThreshold: 60
      },
      cwd: collection.rootFolder,
      ignoreInitial: true
    })

    watcher.on('all', await this.onWatchEvent)
  }

  static async onWatchEvent (event, path) {
    logger.debug(`Event: "${event}" on file: ${path} detected`)

    const collection = await CollectionFactory.fromArchieCall()
    return CollectionBuilder.build(collection)
  }
}

export default CollectionWatcher
