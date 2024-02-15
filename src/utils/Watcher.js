// eslint-disable-next-line no-unused-vars
import { FSWatcher, watch } from 'chokidar'
import logger, { logSpacer } from './Logger.js'
import { ucfirst } from './SyntaxUtils.js'
import { basename } from 'node:path'

class Watcher {
  /**
   * Watch target files and folders
   * @param {string} rootFolder
   * @param {string[]} [ignorePatterns]
   * @return {FSWatcher}
   */
  static getWatcher (rootFolder, ignorePatterns) {
    const targets = [
      rootFolder
    ]

    /** @type {import('chokidar').WatchOptions} */
    const watchOptions = {
      awaitWriteFinish: {
        pollInterval: 20,
        stabilityThreshold: 60
      },
      cwd: rootFolder,
      ignoreInitial: true
    }

    if (ignorePatterns) {
      watchOptions.ignored = ignorePatterns
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

  /**
   * Log Watch Initialization
   * @param {string[]} initLines
   */
  static logInit (initLines) {
    logSpacer()
    logger.info('--------------------------------------------------------')
    initLines.forEach(initLine => logger.info(initLine))
    logger.info('(Ctrl+C to abort)')
    logger.info('--------------------------------------------------------')
    logSpacer()
  }

  /**
   * Log Watcher Event
   * @param {string} event Watcher Event
   * @param {string} eventPath Watcher Event Path
   */
  static logEvent (event, eventPath) {
    const filename = basename(eventPath)
    logSpacer()
    logger.info('--------------------------------------------------------')
    logger.info(`${ucfirst(event)} on ${filename} detected (${eventPath})`)
    logger.info('--------------------------------------------------------')
    logSpacer()
  }
}

export default Watcher
