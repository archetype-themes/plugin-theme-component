import { pino } from 'pino'
import { dirname } from 'path'

const STACKTRACE_OFFSET = 2
const LINE_OFFSET = 7
const { symbols: { asJsonSym } } = pino

function traceCaller (pinoInstance) {
  const get = (target, name) => name === asJsonSym ? asJson : target[name]

  function asJson (...args) {
    args[0] = args[0] || Object.create(null)
    args[0].caller = Error().stack.split('\n')
      .filter(s => !s.includes('node_modules/pino') && !s.includes('node_modules\\pino'))[STACKTRACE_OFFSET]
      .substring(LINE_OFFSET).replace(dirname(dirname(import.meta.url)) + '/', '')

    return pinoInstance[asJsonSym].apply(this, args)
  }

  return new Proxy(pinoInstance, { get })
}

const logger = traceCaller(pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      ignore: 'time,pid,hostname'
    }
  }
}))

export default logger
