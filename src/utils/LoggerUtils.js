import InternalError from '../errors/InternalError.js'
import logger, { AVAILABLE_LOG_LEVELS, INFO_LOG_LEVEL } from './Logger.js'
import { basename } from 'node:path'
import { ucFirst } from './SyntaxUtils.js'

export const topPrefix = '════▶ '
export const childPrefix = '  ╚══▶  '
export const childSpacer = '  ║     '

/**
 * Log Top Item
 * @param {string} message
 */
export function logTitleItem (message) {
  logger.info(`${topPrefix}${message}`)
}

/**
 * Log Child Item
 * @param {string} message - Message to display
 * @param {string} logLevel - Log level (info/warn/error/debug)
 */
export function logChildItem (message, logLevel = INFO_LOG_LEVEL) {
  if (AVAILABLE_LOG_LEVELS.includes(logLevel)) {
    logger[logLevel](`${childPrefix}${message}`)
  } else {
    throw new InternalError(`Invalid Log Level ${logLevel} for logChildItem function call`)
  }
}

/**
 * Logs an empty line as a spacer element
 */
export function logSpacer () {
  logger.info('')
}

/**
 * Log Child Message
 * @param {string} [message='']
 */
export function logChildMessage (message = '') {
  logger.info(childSpacer + message)
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
  logger.info('--------------------------------------------------------')
  customText.forEach(initLine => logger.info(initLine))
  logger.info('(Ctrl+C to abort)')
  logger.info('--------------------------------------------------------')
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
  logger.info('--------------------------------------------------------')
  logger.info(`${action}`)
  logger.info('--------------------------------------------------------')
  logSpacer()
}
