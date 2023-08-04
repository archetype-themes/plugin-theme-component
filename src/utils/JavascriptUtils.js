// Internal Modules
import FileMissingError from '../errors/FileMissingError.js'
import FileUtils from './FileUtils.js'
import InputFileError from '../errors/InputFileError.js'
import logger from './Logger.js'

class JavascriptUtils {
  /**
   * Finds the main or index JavaScript file within the provided file list
   * @param {string[]} files
   * @returns {string}
   * @throws Error
   */
  static findMainJavaScriptFile (files) {
    const regex = /[/\\]((?:index|main)+\.(?:js|mjs))$/i
    const matches = []
    for (const jsFile of files) {
      const match = regex.exec(jsFile)
      if (match) {
        matches.push(match.input)
      }
    }

    if (matches.length === 1) {
      logger.debug(`JavaScript Entrypoint found: ${FileUtils.convertToComponentRelativePath(matches[0])}`)
      return matches[0]
    } else if (matches.length === 0) {
      throw new FileMissingError('An index or main JavaScript file could not be found.')
    }
    logger.debug(matches)
    throw new InputFileError('Only one index or main JavaScript file is allowed but multiple matches were found.')
  }

  /**
   * Get the main/index javascript file within the provided file list
   * @param {string[]} files
   * @returns {string}
   * @throws Error
   */
  static getMainJavascriptFile (files) {
    // If there's only 1 JavaScript file, take it!
    if (files.length === 1) {
      return files[0]
    } else {
      // If we have more than one JavaScript file, try to find a single main/index file (one ring to rule them all)
      return this.findMainJavaScriptFile(files)
    }
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
      // When building a Collection, multiple Sections might include the same snippet,
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
