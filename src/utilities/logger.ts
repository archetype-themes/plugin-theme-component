import { Command } from '@oclif/core'

interface Logger {
  error: Command['error']
  log: Command['log']
  warn: Command['warn']
  debug: (...args: any[]) => void
}

type CommandLogger = Command

let logger: CommandLogger | undefined

export function initializeLogger(commandLogger: CommandLogger): void {
  if (logger) return // Only initialize once
  logger = commandLogger
}

function getLogger(): CommandLogger {
  if (!logger) {
    throw new Error('Logger not initialized. Call initializeLogger() first.')
  }
  return logger
}

// Create the logger proxy
export const themeComponentLogger = new Proxy({} as Logger, {
  get(_, prop) {
    return getLogger()[prop as keyof Logger]
  }
})

export default themeComponentLogger 