// Internal Modules
import FileUtils from './FileUtils.js'
import logger from './Logger.js'

class JavascriptUtils {
  /**
   * Finds the main or index JavaScript file within the provided file list
   * @param {string[]} files
   * @param {string} componentName
   * @returns {string | undefined}
   */
  static findMainJavaScriptFile (files, componentName) {
    const regex = this.mainJavaScriptFileRegex(componentName)
    const mainJavaScriptFile = files.find(file => regex.test(file))

    if (!mainJavaScriptFile) {
      return undefined
    }

    logger.debug(`JavaScript Entrypoint found: ${FileUtils.convertToComponentRelativePath(mainJavaScriptFile)}`)

    return mainJavaScriptFile
  }

  /**
   * @param {string} componentName
   */
  static mainJavaScriptFileRegex (componentName) {
    return new RegExp(`^.+\\/${componentName}\\.(js|mjs)$`)
  }
}

export default JavascriptUtils
