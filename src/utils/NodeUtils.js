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
   * Get NodeJS Package Scope (ie: @archetype-themes)
   * @return {string}
   */
  static getPackageScope () {
    return env.npm_package_name.includes('/') ? env.npm_package_name.split('/')[0] : env.npm_package_name
  }

  /**
   * Get Package Root Folder
   * @return {string}
   */
  static getPackageRootFolder () {
    // Generic env variable (should be set by npm and yarn)
    if (env.npm_package_json) {
      return dirname(env.npm_package_json)
    }

    throw new Error('Unable to get Package Root Folder through Environment Variables. Please make sure you are running Archie from within a Node Package folder.')
  }

  /**
   * Get Root Repo Folder (useful in a monorepo context)
   * @returns {string}
   */
  static getMonorepoRootFolder () {
    // NPM specific env variable
    if (env.npm_config_local_prefix) {
      return env.npm_config_local_prefix.toString()
    }

    // Yarn Berry specific env variable
    if (env.PROJECT_CWD) {
      // yarn berry
      return env.PROJECT_CWD.toString()
    }

    throw new Error('Monorepo Root Folder couldn\'t be found in the environment variables. Please make sure you are running Archie from within a Node Package folder.')
  }

  /**
   * Shortcut to a method to get root folder username
   * @returns {string}
   */
  static getArchieRootFolderName () {
    return dirname(dirname(dirname(import.meta.url)).substring(7))
  }

  /**
   * Exit with Error
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
