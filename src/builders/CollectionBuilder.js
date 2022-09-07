import logger from '../utils/Logger.js'
import { env } from 'node:process'

class CollectionBuilder {
  /**
   *
   * @param {string} collectionName
   * @return {Promise<void>}
   */
  static async build (collectionName) {
    logger.info(`Building ${collectionName} Collection ...`)
  }

  static install (collectionName) {
    logger.info(`Installing ${collectionName} Collection for ${env.npm_package_name}.`)
  }
}

export default CollectionBuilder
