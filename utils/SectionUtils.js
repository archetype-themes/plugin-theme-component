import { cwd, env } from 'node:process'

class SectionUtils {
  /**
   * Detects the package Folder Name
   * @param {string} packageName
   * @returns {string}
   */
  static detectSectionFolder (packageName) {
    let packageFolder
    if (env.npm_config_local_prefix)
      packageFolder = env.npm_config_local_prefix
    else {
      packageFolder = cwd()

      if (packageFolder.includes(packageName)) {
        packageFolder = packageFolder.substring(0, packageFolder.lastIndexOf(packageName) + packageName.length)
      }
    }
    return packageFolder
  }

}

export default SectionUtils
