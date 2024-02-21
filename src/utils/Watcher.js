// eslint-disable-next-line no-unused-vars
import { FSWatcher, watch as chokidarWatch } from 'chokidar'
import logger from './Logger.js'
import { CONFIG_FILE_NAME, DEV_FOLDER_NAME } from '../config/CLI.js'
import gitignore from 'parse-gitignore'
import { join } from 'node:path'

const IGNORE_PATTERNS = [
  'package.json',
  'package-lock.json',
  '.git',
  '.github',
  DEV_FOLDER_NAME,
  CONFIG_FILE_NAME,
  'bin',
  '**/.*',
  '**/*.md'
]

/**
 * Get ignore patterns
 * @param {string} [path] - Path to .gitignore file to scan for patterns
 * @returns {string[]}
 */
export function getIgnorePatterns (path) {
  const ignorePatterns = IGNORE_PATTERNS
  if (path) {
    const gitIgnoreFile = join(path, '.gitignore')
    const gitIgnorePatterns = gitignore.parse(gitIgnoreFile).patterns
    ignorePatterns.push(...gitIgnorePatterns)
  }
  return ignorePatterns
}

/**
 * Watch target files and folders
 * @param {string} rootFolder
 * @param {string[]} [ignorePatterns]
 * @return {FSWatcher}
 */
export function getWatcher (rootFolder, ignorePatterns) {
  const targets = [rootFolder]

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
  return chokidarWatch(targets, watchOptions)
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
