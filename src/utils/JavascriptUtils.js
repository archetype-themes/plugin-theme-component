// Internal Modules
import FileUtils from './FileUtils.js'
import logger from './Logger.js'

class JavascriptUtils {
  /**
   * Finds the main or index JavaScript file within the provided file list
   * @param {string[]} files
   * @param {string} jsProcessor
   * @param {string} componentName
   * @returns {string | undefined}
   */
  static findMainJavaScriptFile (files, jsProcessor, componentName) {
    const regex = this.mainJavaScriptFileRegex(componentName, jsProcessor)
    const mainJavaScriptFile = files.find(file => regex.test(file))

    if (!mainJavaScriptFile) {
      return
    }

    logger.debug(`JavaScript Entrypoint found: ${FileUtils.convertToComponentRelativePath(mainJavaScriptFile)}`)

    return mainJavaScriptFile
  }

  /**
   * @param {string} componentName
   * @param {string} jsProcessor
   */
  static mainJavaScriptFileRegex (componentName, jsProcessor) {
    if (jsProcessor === 'esbuild') {
      return /[/\\]((?:index|main)+\.(?:js|mjs))$/i
    }
    return new RegExp(`^.+\\/${componentName}\\.(js|mjs)$`)
  }

  /**
   * Generate JS Bundle Index
   * @param {string[]} javascriptFiles
   * @return string
   */
  static generateJsBundleIndex (javascriptFiles) {
    let jsBundleIndexContents = ''
    const processedJavascriptFiles = []

    for (const javascriptFile of javascriptFiles) {
      // When building a Collection, multiple Components might include the same snippet,
      // Therefore we check for duplicates
      if (!processedJavascriptFiles.includes(javascriptFile)) {
        jsBundleIndexContents += `import '${javascriptFile}'\n`
        processedJavascriptFiles.push(javascriptFile)
      }
    }

    return jsBundleIndexContents
  }
}

export default JavascriptUtils
