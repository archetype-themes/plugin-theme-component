// Node JS internal imports
import { unlink } from 'node:fs/promises'
import path from 'path'
// Archie Internal imports
import PostCssProcessor from './PostCssProcessor.js'
import SassPreProcessor from './SassPreProcessor.js'
import FileAccessError from '../errors/FileAccessError.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'
import os from 'os'

class StylesProcessor {
  /**
   * Process Styles by using all appropriate style preprocessors
   * @param {string} sourceFile
   * @param {string} outputFile
   * @returns {Promise<string>} Final styles
   */
  static async buildStyles (sourceFile, outputFile) {
    if (this.isSassFile(sourceFile)) {
      return SassPreProcessor.processStyleSheet(sourceFile)
    } else {
      const css = await FileUtils.getFileContents(sourceFile)
      return PostCssProcessor.processStyles(css, sourceFile, outputFile)
    }
  }

  /**
   * Create Styles Bundle
   * @param {string[]} stylesheets
   * @param {string} outputFile
   * @return {Promise<string>}
   */
  static async buildStylesBundle (stylesheets, outputFile) {
    const masterStylesheet = path.join(os.tmpdir(), 'masterStylesheet.css')
    const masterStylesheetContents = this.createMasterStylesheet(stylesheets)

    await FileUtils.writeFile(masterStylesheet, masterStylesheetContents)

    const css = await PostCssProcessor.processStyles(masterStylesheetContents, masterStylesheet, outputFile)
    await unlink(masterStylesheet)
    return css
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

  static isSassFile (filename) {
    return ['.scss', '.sass'].includes(path.extname(filename))
  }
}

export default StylesProcessor
