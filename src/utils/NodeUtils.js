// NodeJS imports
import { argv, env, exit } from 'node:process'
import { dirname } from 'path'
// External libraries imports
import merge from 'deepmerge'
// Archie imports
import FileUtils from './FileUtils.js'
import logger from './Logger.js'

class NodeUtils {
  /**
   * Get Command Line Args
   * @return {string[]}
   */
  static getArgs () {
    const args = argv.slice(2)
    const filteredArgs = []

    for (const arg of args) {
      if (!arg.match(/^--(verbose|quiet|debug)$/i)) {
        filteredArgs.push(arg)
      }
    }

    return filteredArgs
  }

  /**
   * Get Package JSON Content as an Object
   * @return {Promise<Object>}
   */
  static async getPackageJsonData () {
    if (!env.npm_package_json) {
      throw new Error('Environment variable "npm_package_json" is not available. Please make sure to use this command with a recent version of npm.')
    }

    return JSON.parse(await FileUtils.getFileContents(env.npm_package_json))
  }

  /**
   * Get NodeJS package name without the namespace
   * @return {string}
   */
  static getPackageName () {
    return env.npm_package_name.includes('/') ? env.npm_package_name.split('/')[1] : env.npm_package_name
  }

  /**
   * Get Package Root Folder
   * @return {string}
   */
  static getPackageRootFolder () {
    if (!env.npm_package_json) {
      throw new Error(
        'Environment variable npm_package_json is not set. Please make sure you are executing Archie from within a Node Package folder.')
    }
    return dirname(env.npm_package_json)
  }

  /**
   * Shortcut to a method to get root folder username
   * @returns {string}
   */
  static getArchieRootFolderName () {
    return dirname(dirname(dirname(import.meta.url)).substring(7))
  }

  /**
   *
   * @param {Error|string} error
   */
  static exitWithError (error) {
    if (typeof error === 'string' || error instanceof String) {
      logger.error(error)
    } else {
      if (logger.isLevelEnabled('debug')) {
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
    }
    exit(1)
  }

  /**
   *
   * @param {Object[]} sourceArray
   * @param {Object[]} newArray
   * @return {Object[]}
   */
  static mergeObjectArrays (sourceArray, newArray) {
    const finalArray = sourceArray

    for (const key in newArray) {
      if (finalArray[key]) {
        finalArray[key] = merge(finalArray[key], newArray[key])
      } else {
        finalArray[key] = newArray[key]
      }
    }

    return finalArray
  }
}

export default NodeUtils
