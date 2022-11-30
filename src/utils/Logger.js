import { argv } from 'node:process'
import pino from 'pino'
import PinoPretty from 'pino-pretty'
import NodeUtils from './NodeUtils.js'

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

  function asJson (...args) {
    args[0] = args[0] || Object.create(null)
    args[0].caller = Error().stack.split('\n')
      .filter(s => !s.includes('node_modules/pino') && !s.includes('node_modules\\pino'))[STACKTRACE_OFFSET]
      .substring(LINE_OFFSET).replace(`file://${NodeUtils.getRootFolderName()}`, '')

    return pinoInstance[asJsonSym].apply(this, args)
  }

  return new Proxy(pinoInstance, { get })
}

let loglevel = 'info'

if (argv.includes('--quiet')) {
  loglevel = 'error'
} else if (argv.includes('--verbose') || argv.includes('--debug')) {
  loglevel = 'debug'
}

/** @type{PrettyOptions} */
const prettyOptions = {
  colorize: true,
  ignore: 'time,pid,hostname',
  singleLine: false
}

if (loglevel === 'debug') {
  prettyOptions.messageFormat = '\n >>> {msg}'
}

const prettyPluginStream = PinoPretty(prettyOptions)

let logger = pino({ level: loglevel }, prettyPluginStream)

if (loglevel === 'debug') {
  logger = traceCaller(logger)
}

export default logger
