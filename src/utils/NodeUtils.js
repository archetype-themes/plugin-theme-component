// Node.js imports
import { argv, exit } from 'node:process'
import { dirname } from 'node:path'

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
   * Check if variable is of type string
   * @param {*} variable
   * @returns {boolean}
   */
  static isString (variable) {
    return (typeof variable === 'string' || variable instanceof String)
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

  /**
   * Returns the file path of the current module.
   * @param {string} importMetaUrl - The import.meta.url of the current module.
   * @return {string} - The file path of the current module.
   */
  static getCurrentFilePath (importMetaUrl) {
    return new URL(importMetaUrl).pathname
  }

  /**
   * Retrieves the current folder of the file where the method is being called.
   * @param {string} importMetaUrl - The import.meta.url of the current file.
   * @returns {string} The current folder of the file.
   */
  static getCurrentFileFolder (importMetaUrl) {
    return dirname(NodeUtils.getCurrentFilePath(importMetaUrl))
  }
}

export default NodeUtils

// Export static methods individually
export const exitWithError = NodeUtils.exitWithError
export const getArgs = NodeUtils.getArgs
export const getCLIRootFolderName = NodeUtils.getCLIRootFolderName
export const getCurrentFileFolder = NodeUtils.getCurrentFileFolder

export const getCurrentFilePath = NodeUtils.getCurrentFilePath
export const isString = NodeUtils.isString
