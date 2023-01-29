import { dirname, join } from 'path'
import { env } from 'node:process'
import ArchieConfig from '../cli/models/ArchieConfig.js'
import FileUtils from './FileUtils.js'
import logger from './Logger.js'

class ThemeUtils {
  /**
   * Find Collection Package Root Folder
   * @param {string} collectionName
   * @return {Promise<string>}
   */
  static async findCollectionPackageRootFolder (collectionName) {
    const childRepoPath = join(dirname(env.npm_package_json), 'node_modules', ArchieConfig.DEFAULT_PACKAGE_SCOPE, collectionName)
    if (await FileUtils.isReadable(childRepoPath))
      return childRepoPath
    else {
      const parentRepoPath = join(env.PROJECT_CWD, 'node_modules', ArchieConfig.DEFAULT_PACKAGE_SCOPE, collectionName)
      if (await FileUtils.isReadable(parentRepoPath)) {
        return parentRepoPath
      } else {
        logger.error(`Collection Install cancelled: ${collectionName} was not found at any expected location: "${childRepoPath}" nor "${parentRepoPath}".`)
        const error = new Error(`${collectionName} Collection not accessible. Is it installed? `)
        error.name = 'File Access Error'
        throw error
      }
    }
  }

}

export default ThemeUtils
