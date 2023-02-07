import { dirname, join } from 'path'
import { env } from 'node:process'
import Components from '../config/Components.js'
import FileUtils from './FileUtils.js'
import logger from './Logger.js'
import FileAccessError from '../errors/FileAccessError.js'

class ThemeUtils {
  /**
   * Find Collection Package Root Folder
   * @param {string} collectionName
   * @return {Promise<string>}
   */
  static async findCollectionPackageRootFolder (collectionName) {
    const childRepoPath = join(
      dirname(env.npm_package_json),
      'node_modules',
      Components.DEFAULT_PACKAGE_SCOPE,
      collectionName
    )
    if (await FileUtils.isReadable(childRepoPath))
      return childRepoPath
    else {
      let rootFolder

      // yarn berry
      if (env.PROJECT_CWD) {
        rootFolder = env.PROJECT_CWD
      }
      // npm
      else if (env.npm_config_local_prefix) {
        rootFolder = env.npm_config_local_prefix
      } else {
        logger.debug(`Collection Install cancelled: neither of 'PROJECT_CWD' or 'npm_config_local_prefix' environment variables detected.`)
        throw new FileAccessError(`${collectionName} Collection not found or not accessible. Is it installed?`)
      }

      const parentRepoPath = join(rootFolder, 'node_modules', Components.DEFAULT_PACKAGE_SCOPE, collectionName)
      if (await FileUtils.isReadable(parentRepoPath)) {
        return parentRepoPath
      } else {
        logger.debug(`Collection Install cancelled: ${collectionName} was not found at any expected location: "${childRepoPath}" nor "${parentRepoPath}".`)
        throw new FileAccessError(`${collectionName} Collection not found or not accessible. Is it installed?`)
      }
    }
  }

}

export default ThemeUtils
