// External Dependencies
import { basename } from 'node:path'
import { ux } from '@oclif/core'

// Internal Dependencies
import { ucFirst } from './SyntaxUtils.js'
import InternalError from '../errors/InternalError.js'

export const Levels = {
  Fatal: 'fatal',
  Error: 'error',
  Warn: 'warn',
  Info: 'info',
  Debug: 'debug',
  Trace: 'trace'

}

export const topPrefix = '════▶ '
export const childPrefix = '  ╚══▶  '
export const childSpacer = '  ║     '

/**
 * Log Top Item
 * @param {string} message
 */
export function logTitleItem (message) {
  ux.info(`${topPrefix}${message}`)
}

/**
 * Log Child Item
 * @param {string} message - Message to display
 * @param {string} logLevel - Log level (info/warn/error/debug)
 */
export function logChildItem (message, logLevel = Levels.Info) {
  if (Object.values(Levels).includes(logLevel)) {
    ux[logLevel](`${childPrefix}${message}`, { exit: false })
  } else {
    throw new InternalError(`Invalid Log Level ${logLevel} for logChildItem function call`)
  }
}

/**
 * Logs an empty line as a spacer element
 */
export function logSpacer () {
  ux.info('')
}

/**
 * Log Child Message
 * @param {string} [message='']
 */
export function logChildMessage (message = '') {
  ux.info(childSpacer + message)
}

/**
 * Log Watcher Initialization
 * @param {string|string[]} customText
 */
export function logWatcherInit (customText) {
  if (!Array.isArray(customText)) {
    customText = [customText]
  }
  logSpacer()
  ux.info('--------------------------------------------------------')
  customText.forEach(initLine => ux.info(initLine))
  ux.info('(Ctrl+C to abort)')
  ux.info('--------------------------------------------------------')
  logSpacer()
}

/**
 * Log Watcher Event
 * @param {string} event Watcher Event
 * @param {string} eventPath Watcher Event Path
 */
export function logWatcherEvent (event, eventPath) {
  const filename = basename(eventPath)
  logWatcherAction(`${ucFirst(event)} on ${filename} detected (${eventPath})`)
}

/**
 * Log Watcher Action
 * @param {string} action
 */
export function logWatcherAction (action) {
  logSpacer()
  ux.info('--------------------------------------------------------')
  ux.info(`${action}`)
  ux.info('--------------------------------------------------------')
  logSpacer()
}

/**
 * Is Debug Level Enabled
 * Returns true when output level is debug or trace.
 * @return {boolean}
 */
export function isDebugEnabled () {
  return [Levels.Debug, Levels.Trace].includes(ux.config.outputLevel)
}
