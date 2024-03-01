// External Dependencies
import { join } from 'node:path'
import { ux } from '@oclif/core'
// eslint-disable-next-line no-unused-vars
import { FSWatcher, watch as chokidarWatch } from 'chokidar'
import gitignore from 'parse-gitignore'

// Internal Dependencies
import { CONFIG_FILE_NAME, DEV_FOLDER_NAME } from '../config/CLI.js'

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
 * @param {(string|RegExp)[]} [ignorePatterns]
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

  ux.debug('Chokidar will watch the following files & folders:')
  targets.map(target => ux.debug(target))
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
