import { argv, env } from 'node:process'
import pino from 'pino'
import PinoPretty from 'pino-pretty'
import { dirname } from 'path'

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
  const rootFolder = dirname(dirname(dirname(import.meta.url)).substring(7))

  function asJson (...args) {
    args[0] = args[0] || Object.create(null)
    args[0].caller = Error().stack.split('\n')
      .filter(s => !s.includes('node_modules/pino') && !s.includes('node_modules\\pino'))[STACKTRACE_OFFSET]
      .substring(LINE_OFFSET).replace(`file://${rootFolder}`, '')

    return pinoInstance[asJsonSym].apply(this, args)
  }

  return new Proxy(pinoInstance, { get })
}

let loglevel = 'info'

/****                        Setting loglevel value                                  ****/
/*                                                                                      */
/* YARN: argv works nicely with yarn berry                                              */
/* NPM: argv is intercepted by npm, therefore we also check for env.npm_config_loglevel */

if (argv.includes('--quiet') ||
  (
    env.npm_config_loglevel && ['error', 'warn', 'silent'].includes(env.npm_config_loglevel)
  )) {
  loglevel = 'error'
} else if (
  argv.includes('--verbose') ||
  argv.includes('--debug') ||
  (
    env.npm_config_loglevel && ['verbose', 'silly'].includes(env.npm_config_loglevel)
  )) {
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
