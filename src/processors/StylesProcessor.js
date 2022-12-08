// Node JS internal imports
import path from 'path'
import { unlink } from 'node:fs/promises'
// Archie Internal imports
import PostCssProcessor from './PostCssProcessor.js'
import SassPreProcessor from './SassPreProcessor.js'
import FileAccessError from '../errors/FileAccessError.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'

class StylesProcessor {
  /**
   * Process Styles by using all appropriate style preprocessors
   * @param {string} outputFile
   * @param {string} mainStyleSheet
   * @param {string[]} additionalFiles
   * @returns {Promise<string>} Final styles
   */
  static async buildStyles (outputFile, mainStyleSheet, additionalFiles = []) {
    const mainStyleSheetExtension = path.extname(mainStyleSheet)

    if (['.scss', '.sass'].includes(mainStyleSheetExtension)) {
      const css = SassPreProcessor.processStyleSheet(mainStyleSheet)
      const tmpCssOutputFile = mainStyleSheet.replace(mainStyleSheetExtension, '.css')
      await FileUtils.writeFile(tmpCssOutputFile, css)
      const finalCss = await PostCssProcessor.processStyles(css, tmpCssOutputFile, outputFile)
      await unlink(tmpCssOutputFile)

      return finalCss
    } else if ('.css' === mainStyleSheetExtension) {
      const css = await FileUtils.getFileContents(mainStyleSheet)

      return PostCssProcessor.processStyles(css, mainStyleSheet, outputFile)
    }
  }

  /**
   * Get the main/index stylesheet file within the provided file list
   * @param {string[]} styleSheets
   * @returns {string}
   * @throws Error
   */
  static getMainStyleSheet (styleSheets) {
    // If there's only 1 JavaScript file, take it!
    if (styleSheets.length === 1) {
      return styleSheets[0]
    } else {
      // If we have more than one JavaScript file, try to find a single main/index file (one ring to rule them all)
      return this.findMainStyleSheetFile(styleSheets)
    }
  }

  /**
   * Find Main StyleSheet within the provided file list
   * @param {string[]} styleSheets
   * @returns {string}
   * @throws Error
   */
  static findMainStyleSheetFile (styleSheets) {
    const regex = /[/\\]((?:index|main)+\.(?:css|less|sass|scss))$/i
    const matches = []
    for (const styleSheet of styleSheets) {
      const match = styleSheet.match(regex)
      if (match) {
        matches.push(match.input)
      }
    }

    if (matches.length === 1) {
      logger.debug(`Main StyleSheet Found: ${FileUtils.convertToComponentRelativePath(matches[0])}`)
      return matches[0]
    } else if (matches.length === 0) {
      throw new FileAccessError('An index or main StyleSheet file could not be found.')
    }
    logger.debug(matches)
    throw new FileAccessError('Only one index or main StyleSheet file is allowed but multiple matches were found.')
  }

  /**
   * Create Master Sass File
   * @param {string[]} stylesheets
   * @return {string}
   */
  static createMasterSassFile (stylesheets) {
    let masterSassFileContent = ''

    for (const stylesheet of stylesheets) {
      masterSassFileContent += `@use '${stylesheet}' as *\n`
    }

    return masterSassFileContent
  }

  /**
   * Create Master Stylesheet
   * @param stylesheets
   * @return {string}
   */
  static createMasterStylesheet (stylesheets) {
    let masterStylesheetContents = ''

    for (const stylesheet of stylesheets) {
      masterStylesheetContents += `@import url('${stylesheet}');\n`
    }

    return masterStylesheetContents
  }

  static canWeUseMasterSassFile (stylesheets) {
    for (const stylesheet of stylesheets) {
      if (!['.css', '.scss', '.sass'].includes(path.extname(stylesheet))) {
        return false
      }
    }
    return true
  }
}

export default StylesProcessor
