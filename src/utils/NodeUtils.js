// Node.js imports
import { argv, env, exit } from 'node:process'
import { dirname, join } from 'node:path'

// Internal Imports
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
   * @param {string} [cwd]
   * @return {Promise<Object>}
   */
  static async getPackageManifest (cwd) {
    if (!cwd && !env.npm_package_json) {
      throw new InternalError('Environment variable "npm_package_json" is not available. Please make sure to use this command with a recent version of npm.')
    }

    let packageJsonFile

    if (cwd) {
      packageJsonFile = join(cwd, 'package.json')
    } else {
      packageJsonFile = env.npm_package_json
    }

    return await FileUtils.getJsonFileContents(packageJsonFile)
  }

  /**
   * Get Node.js package name without the scope
   * @param {Object} [packageManifest] Optional Package Manifest JSON object
   * @return {string}
   */
  static getPackageName (packageManifest) {
    let packageNameAndScope
    if (packageManifest?.name) {
      packageNameAndScope = packageManifest.name
    } else if (env.npm_package_name) {
      packageNameAndScope = env.npm_package_name
    } else {
      throw new InternalError('Unavailable NPM Package Name environment variable and/or Package Manifest')
    }

    return packageNameAndScope.includes('/') ? packageNameAndScope.split('/')[1] : packageNameAndScope
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

    throw new InternalError('Unable to get Package Root Folder through Environment Variables. Please make sure you are running this CLI from within a Node Package folder.')
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

    throw new InternalError('Monorepo Root Folder couldn\'t be found in the environment variables. Please make sure you are running the CLI from within a Node Package folder.')
  }

  /**
   * Shortcut to a method to get root folder username
   * @returns {string}
   */
  static getCLIRootFolderName () {
    return new URL('../../', import.meta.url).pathname
  }

  /**
   * Get Workspaces
   * @returns {Promise<string[]>}
   */
  static async getWorkspaces (packageManifest) {
    if (!packageManifest) {
      packageManifest = await NodeUtils.getPackageManifest()
    }
    return packageManifest.workspaces
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

// Export static methods individually
export const getArgs = NodeUtils.getArgs
export const getPackageManifest = NodeUtils.getPackageManifest
export const getPackageName = NodeUtils.getPackageName
export const getPackageScope = NodeUtils.getPackageScope
export const getPackageRootFolder = NodeUtils.getPackageRootFolder
export const getMonorepoRootFolder = NodeUtils.getMonorepoRootFolder
export const getCLIRootFolderName = NodeUtils.getCLIRootFolderName
export const getWorkspaces = NodeUtils.getWorkspaces
export const isString = NodeUtils.isString
export const exitWithError = NodeUtils.exitWithError
