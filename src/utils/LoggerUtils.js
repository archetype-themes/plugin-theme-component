// External Dependencies
import { basename } from 'node:path'

// Internal Dependencies
import { ucFirst } from './SyntaxUtils.js'
import Session from '../models/static/Session.js'

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
export function logTitleItem(message) {
  logSpacer()
  info(`${topPrefix}${message}`)
}

/**
 * Log Child Item (With Pointer)
 * @param {string} message - Message to display
 * @param {number} [indentTabs] - Number of tabs to indent
 */
export function logChildItem(message, indentTabs = 0) {
  const tabs = '  ║'.repeat(indentTabs)
  info(`${tabs}${childPrefix}${message}`)
}

/**
 * Log Child Message Without Pointer
 * @param {string} [message='']
 */
export function logChildMessage(message = '') {
  info(childSpacer + message)
}

export function logSeparator() {
  info('--------------------------------------------------------')
}

/**
 * Logs an empty line as a spacer element
 */
export function logSpacer() {
  info('')
}

/**
 * Log Watcher Initialization
 * @param {string|string[]} customText
 */
export function logWatcherInit(customText) {
  if (!Array.isArray(customText)) {
    customText = [customText]
  }
  logSpacer()
  info('--------------------------------------------------------')
  customText.forEach((initLine) => info(initLine))
  info('(Ctrl+C to abort)')
  info('--------------------------------------------------------')
  logSpacer()
}

/**
 * Log Watcher Event
 * @param {string} event Watcher Event
 * @param {string} eventPath Watcher Event Path
 */
export function logWatcherEvent(event, eventPath) {
  const filename = basename(eventPath)
  logWatcherAction(`${ucFirst(event)} on ${filename} detected (${eventPath})`)
}

/**
 * Log Watcher Action
 * @param {string} action
 */
export function logWatcherAction(action) {
  logSpacer()
  info('--------------------------------------------------------')
  info(`${action}`)
  info('--------------------------------------------------------')
  logSpacer()
}

/**
 * Is Debug Level Enabled
 * Returns true when output level is debug or trace.
 * @return {boolean}
 */
function isDebugEnabled() {
  return [Levels.Debug, Levels.Trace].includes(Session.logLevel)
}

/**
 * Display A Fatal Error And Quit
 * @param {string} message Custom Error Message
 * @param {Error} [e] Error object
 */
export function fatal(message, e) {
  const errorMessage = '\x1b[35mFATAL ERROR:\x1b[0m ' + message
  if (e) {
    if (isDebugEnabled()) {
      console.log(errorMessage, e.stack)
    } else {
      console.log(errorMessage, e.message)
    }
  } else {
    console.log(errorMessage)
  }

  // Exit the program
  process.exit(1)
}

/**
 * Display An Error Message
 * @param {string} message
 * @param {Error} [e] Error object
 */
export function error(message, e) {
  if ([Levels.Error, Levels.Warn, Levels.Info, Levels.Debug, Levels.Trace].includes(Session.logLevel)) {
    const errorMessage = '\x1b[31mERROR:\x1b[0m ' + message
    if (e) {
      if (isDebugEnabled()) {
        console.log(errorMessage, e.stack)
      } else {
        console.log(errorMessage, e.message)
      }
    } else {
      console.log(errorMessage)
    }
  }
}

/**
 * Display A Warning Message
 * @param {string} message
 */
export function warn(message) {
  if ([Levels.Warn, Levels.Info, Levels.Debug, Levels.Trace].includes(Session.logLevel)) {
    console.log('\x1b[33mWARNING:\x1b[0m ' + message)
  }
}

/**
 * Display An Informative Message
 * @param {string} message
 */
export function info(message) {
  if ([Levels.Info, Levels.Debug, Levels.Trace].includes(Session.logLevel)) {
    if (isDebugEnabled()) {
      console.log('\x1b[34mINFO:\x1b[0m ' + message)
    } else {
      console.log(message)
    }
  }
}

/**
 * Display A Debug Message
 * @param {string} message
 */
export function debug(message) {
  if ([Levels.Debug, Levels.Trace].includes(Session.logLevel)) {
    console.log('\x1b[90mDEBUG:\x1b[0m ' + message)
  }
}

/**
 * Display A Trace Message
 * @param {string} message
 */
export function trace(message) {
  if (Session.logLevel === Levels.Trace) {
    console.log('\x1b[37mTRACE:\x1b[0m ' + message)
  }
}
