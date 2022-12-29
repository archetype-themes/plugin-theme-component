import { FSWatcher, watch } from 'chokidar'
import logger from './Logger.js'

class Watcher {

  /**
   * Watch target files and folders
   * @param {string[]} targets target paths
   * @param {string} [rootFolder] Use if target paths are relative
   * @return {FSWatcher}
   */
  static getWatcher (targets, rootFolder) {
    const watchOptions = {
      awaitWriteFinish: {
        pollInterval: 20, stabilityThreshold: 60
      }, ignoreInitial: true
    }

    if (rootFolder) {
      watchOptions.cwd = rootFolder
    }
    logger.debug('Chokidar will watch the following files & folders:')
    logger.debug(targets)
    return watch(targets, watchOptions)
  }

  /**
   * Apply watch action to all files
   * @param {FSWatcher} watcher
   * @param {function} action
   * @return {FSWatcher}
   */
  static watch (watcher, action) {
    return watcher.on('all', action)
  }

}

export default Watcher
