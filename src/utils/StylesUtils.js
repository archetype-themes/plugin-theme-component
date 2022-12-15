import path from 'path'
import logger from './Logger.js'
import FileUtils from './FileUtils.js'
import FileAccessError from '../errors/FileAccessError.js'

class StylesUtils {

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
   *
   * @param {string[]} styleSheets
   * @return {string}
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

  static isSassFile (filename) {
    return ['.scss', '.sass'].includes(path.extname(filename))
  }

}

export default StylesUtils
