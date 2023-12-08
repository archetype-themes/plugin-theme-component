import { argv, env } from 'node:process'
import pino from 'pino'
import PinoPretty from 'pino-pretty'
import InternalError from '../errors/InternalError.js'

export const DEBUG_LOG_LEVEL = 'debug'
export const ERROR_LOG_LEVEL = 'error'
export const INFO_LOG_LEVEL = 'info'
export const TRACE_LOG_LEVEL = 'trace'
export const WARN_LOG_LEVEL = 'warn'
export const AVAILABLE_LOG_LEVELS = [INFO_LOG_LEVEL, WARN_LOG_LEVEL, ERROR_LOG_LEVEL, DEBUG_LOG_LEVEL, TRACE_LOG_LEVEL]
const STACKTRACE_OFFSET = 2
const LINE_OFFSET = 7
const { symbols: { asJsonSym } } = pino

/**
 * Traces Where the Log Event happened in the source code and forwards the information to the Pino Logger
 * @param pinoInstance
 * @returns {*}
 * @link https://gist.github.com/miguelmota/4df504cff4bfebcff982dd06bde7a34a
 */
function traceCaller (pinoInstance) {
  const get = (target, name) => name === asJsonSym ? asJson : target[name]
  const rootFolder = new URL('../../', import.meta.url).pathname

  function asJson (...args) {
    args[0] = args[0] || Object.create(null)
    args[0].caller = Error().stack.split('\n')
      .filter(s => !s.includes('node_modules/pino') && !s.includes('node_modules\\pino'))[STACKTRACE_OFFSET]
      .substring(LINE_OFFSET).replace(`file://${rootFolder}`, '')

    return pinoInstance[asJsonSym].apply(this, args)
  }

  return new Proxy(pinoInstance, { get })
}

let loglevel = INFO_LOG_LEVEL

/**                            Setting loglevel value                                  **/
/*                                                                                      */
/* YARN: argv works nicely with yarn berry                                              */
/* NPM: argv is intercepted by npm, therefore we also check for env.npm_config_loglevel */
if (argv.includes('--quiet') || (env.npm_config_loglevel && ['error', 'warn', 'silent'].includes(env.npm_config_loglevel))) {
  loglevel = ERROR_LOG_LEVEL
} else if (argv.includes('--verbose') || argv.includes('--debug') || (env.npm_config_loglevel && env.npm_config_loglevel === 'verbose')) {
  loglevel = DEBUG_LOG_LEVEL
} else if (argv.includes('--trace') || (env.npm_config_loglevel && env.npm_config_loglevel === 'silly')) {
  loglevel = TRACE_LOG_LEVEL
}

/** @type{PrettyOptions} */
const prettyOptions = {
  colorize: true,
  ignore: 'time,pid,hostname',
  singleLine: false
}

const prettyPluginStream = PinoPretty(prettyOptions)

let logger = pino({ level: loglevel }, prettyPluginStream)

if ([DEBUG_LOG_LEVEL, TRACE_LOG_LEVEL].includes(loglevel)) {
  logger = traceCaller(logger)
}

export default logger

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
