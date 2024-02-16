// Node.js imports
import { argv, exit } from 'node:process'
import { sep } from 'node:path'

// Internal Imports
import logger, { DEBUG_LOG_LEVEL } from './Logger.js'

class NodeUtils {
  /**
   * Get Command Line Args
   * @return {string[]}
   */
  static getArgs () {
    const args = argv.slice(2)
    const filteredArgs = []

    for (const arg of args) {
      if (!/^--(verbose|quiet|debug)$/i.exec(arg)) {
        filteredArgs.push(arg)
      }
    }

    return filteredArgs
  }

  /**
   * Shortcut to a method to get root folder username
   * @returns {string}
   */
  static getCLIRootFolderName () {
    return new URL('../../', import.meta.url).pathname
  }

  /**
   * Exit with Error
   * @param {Error|string} error
   */
  static exitWithError (error) {
    if (typeof error === 'string' || error instanceof String || logger.isLevelEnabled(DEBUG_LOG_LEVEL)) {
      logger.error(error)
    } else {
      let errorMessage = ''
      if (error.name && error.name.toLowerCase() !== 'error') {
        errorMessage = `${error.name}: `
      }
      if (error.message) {
        errorMessage += error.message
      }
      logger.error(errorMessage)
    }
    exit(1)
  }
}

export default NodeUtils

// Export static methods individually
export const exitWithError = NodeUtils.exitWithError
export const getArgs = NodeUtils.getArgs

export function getCurrentWorkingDirectoryName () {
  const currentWorkingDirectory = process.cwd()
  const directoryArray = currentWorkingDirectory.split(sep)

  return directoryArray[directoryArray.length - 1]
}
