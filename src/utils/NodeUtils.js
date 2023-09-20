// Node.js imports
import { argv, env, exit } from 'node:process'
import { dirname } from 'node:path'

// Archie imports
import FileUtils from './FileUtils.js'
import logger from './Logger.js'
import InternalError from '../errors/InternalError.js'

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
   * Get Package JSON Content as an Object
   * @return {Promise<Object>}
   */
  static async getPackageManifest () {
    if (!env.npm_package_json) {
      throw new InternalError('Environment variable "npm_package_json" is not available. Please make sure to use this command with a recent version of npm.')
    }

    return await FileUtils.getJsonFileContents(env.npm_package_json)
  }

  /**
   * Get Node.js package name without the namespace
   * @return {string}
   */
  static getPackageName () {
    if (!env.npm_package_name) {
      throw new InternalError('Unavailable NPM Package Name environment variable')
    }
    return env.npm_package_name.includes('/') ? env.npm_package_name.split('/')[1] : env.npm_package_name
  }

  /**
   * Get Node.js Package Scope (ie: @archetype-themes)
   * @return {string}
   */
  static getPackageScope () {
    if (!env.npm_package_name) {
      throw new InternalError('Unavailable NPM Package Name environment variable')
    }
    return env.npm_package_name.includes('/') ? env.npm_package_name.split('/')[0] : ''
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

    throw new InternalError('Unable to get Package Root Folder through Environment Variables. Please make sure you are running Archie from within a Node Package folder.')
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

    throw new InternalError('Monorepo Root Folder couldn\'t be found in the environment variables. Please make sure you are running Archie from within a Node Package folder.')
  }

  /**
   * Shortcut to a method to get root folder username
   * @returns {string}
   */
  static getArchieRootFolderName () {
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
}

export default NodeUtils
