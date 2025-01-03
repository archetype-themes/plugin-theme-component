import { Command } from '@oclif/core'

type CommandLogger = Pick<Command, 'log' | 'warn' | 'error'>

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
export const themeComponentLogger = new Proxy({} as CommandLogger, {
  get(target, prop) {
    return getLogger()[prop as keyof CommandLogger]
  }
})

export default themeComponentLogger 