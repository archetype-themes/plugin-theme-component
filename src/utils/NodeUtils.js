import { env, exit } from 'node:process'
import FileUtils from './FileUtils.js'
import logger from './Logger.js'

class NodeUtils {
  static #packageJson

  /**
   * Get Command Line Args
   * @return {string[]}
   */
  static getArgs () {
    const args = process.argv.slice(2)
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
   *
   * @param {Error|string} error
   */
  static exitWithError (error) {
    if (typeof error === 'string' || error instanceof String) {
      logger.error(error)
    } else {
      if (error.name && error.name.toLowerCase() !== 'error')
        logger.error(error.name)
      if (error.message) {
        logger.error(error.message)
      }
    }
    exit(1)
  }
}

export default NodeUtils
