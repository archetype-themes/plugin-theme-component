// eslint-disable-next-line no-unused-vars
import { FSWatcher, watch } from 'chokidar'
import logger from './Logger.js'

/**
 * Watch target files and folders
 * @param {string} rootFolder
 * @param {string[]} [ignorePatterns]
 * @return {FSWatcher}
 */
export function getWatcher (rootFolder, ignorePatterns) {
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
export function watch (watcher, action) {
  return watcher.on('all', action)
}

export default { getWatcher, watch }
