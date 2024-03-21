// External Dependencies
import { extname, join, sep } from 'node:path'
import { ux } from '@oclif/core'
// eslint-disable-next-line no-unused-vars
import { FSWatcher, watch as chokidarWatch } from 'chokidar'
import gitignore from 'parse-gitignore'

// Internal Dependencies
import { CONFIG_FILE_NAME, DEV_FOLDER_NAME } from '../config/CLI.js'
import { SETUP_FOLDER_NAME } from '../config/Components.js'
import {
  JSON_EXTENSION,
  LIQUID_EXTENSION,
  SCRIPT_EXTENSIONS,
  STYLE_EXTENSIONS
} from './ComponentFilesUtils.js'

export const ChangeType = {
  Asset: 'asset',
  Stylesheet: 'stylesheet',
  JavaScript: 'JavaScript',
  Liquid: 'liquid',
  Locale: 'locale',
  SetupFiles: 'setup-files'
}

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
export function getIgnorePatterns(path) {
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
export function getWatcher(rootFolder, ignorePatterns) {
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
  targets.map((target) => ux.debug(target))
  return chokidarWatch(targets, watchOptions)
}

/**
 * Apply watch action to all files
 * @param {FSWatcher} watcher
 * @param {function} action
 * @return {FSWatcher}
 */
export function watch(watcher, action) {
  return watcher.on('all', action)
}

/**
 *
 * @param {string} filename
 * @return {string} ChangeType enum value
 */
export function getChangeTypeFromFilename(filename) {
  const extension = extname(filename).toLowerCase()

  if (filename.includes(join(sep, SETUP_FOLDER_NAME, sep))) {
    return ChangeType.SetupFiles
  }
  if (STYLE_EXTENSIONS.includes(extension)) {
    return ChangeType.Stylesheet
  }
  if (SCRIPT_EXTENSIONS.includes(extension)) {
    return ChangeType.JavaScript
  }
  if (LIQUID_EXTENSION === extension) {
    return ChangeType.Liquid
  }
  if (JSON_EXTENSION === extension) {
    return ChangeType.Locale
  }
  return ChangeType.Asset
}

export default {
  getWatcher,
  getChangeTypeFromFilename,
  watch
}
