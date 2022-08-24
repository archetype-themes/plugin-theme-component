import NodeUtils from './NodeUtils.js'
import logger from './Logger.js'
import { exit } from 'node:process'

class BinUtils {
  static async validatePackageIsArchie () {
    const packageJson = await NodeUtils.getPackageJson()

    if (packageJson.name !== 'archie') {
      throw new Error(`Package name "${packageJson.name}" detected.This script is intended for use within the "archie" monorepo.`)
    }
  }

  /**
   *
   * @param {Error|string} error
   */
  static exitWithError (error) {
    if (error.message) {
      logger.error(error.message)
    } else {
      logger.error(error)
    }

    exit(1)
  }
}

export default BinUtils
