import { argv, env, exit } from 'node:process'
import FileUtils from './FileUtils.js'
import logger from './Logger.js'
import { dirname } from 'path'
import merge from 'deepmerge'

class NodeUtils {

  static #packageJson

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
  static async getPackageJson () {
    if (!env.npm_package_json) {
      throw new Error(`Environment variable "npm_package_json" is not available. Please make sure to use this command with a recent version of yarn.`)
    }

    if (!this.#packageJson) {
      this.#packageJson = JSON.parse(await FileUtils.getFileContents(env.npm_package_json))
    }
    return this.#packageJson
  }

  /**
   * Get NodeJS package name without the namespace
   * @return {string}
   */
  static getPackageName () {
    return env.npm_package_name.includes('/') ? env.npm_package_name.split('/')[1] : env.npm_package_name
  }

  /**
   * Get Readable Timestamp
   * @param {Date} [date]
   * @return {string}
   */
  static getReadableTimestamp (date) {
    if (!date) {
      date = new Date()
    }
    const dateString = date.toISOString()

    return dateString.substring(0, 19).replace('T', '_').replaceAll(':', '-')
  }

  /**
   * Shortcut to a method to get root folder username
   * @returns {string}
   */
  static getRootFolderName () {
    return dirname(dirname(import.meta.url)).substring(7)
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

    for (const [key, value] of Object.entries(newArray)) {
      console.log(key, value)
      if (finalArray.hasOwnProperty(key)) {
        finalArray[key] = merge(finalArray[key], newArray[key])
      } else {
        finalArray[key] = newArray[key]
      }
    }

    return finalArray
  }

}

export default NodeUtils
