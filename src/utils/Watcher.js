// eslint-disable-next-line no-unused-vars
import { FSWatcher, watch } from 'chokidar'
import logger, { logSpacer } from './Logger.js'
import { ucFirst } from './SyntaxUtils.js'
import { basename } from 'node:path'

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

/**
 * Log Watch Initialization
 * @param {string[]} initLines
 */
export function logInit (initLines) {
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
export function logEvent (event, eventPath) {
  const filename = basename(eventPath)
  logSpacer()
  logger.info('--------------------------------------------------------')
  logger.info(`${ucFirst(event)} on ${filename} detected (${eventPath})`)
  logger.info('--------------------------------------------------------')
  logSpacer()
}

export default { getWatcher, logEvent, logInit, watch }
