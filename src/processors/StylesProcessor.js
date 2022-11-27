import esbuild from 'esbuild'
import logger from '../utils/Logger.js'
import EsbuildProcessor from './EsbuildProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import FileAccessError from '../errors/FileAccessError.js'
import path from 'path'

const { BuildResult } = esbuild

class StylesProcessor {

  /**
   * This is simply a wrapper for the EsbuildProcessor for now
   * @param {string} outputFile
   * @param {string} mainStyleSheet
   * @param {string[]} additionalFiles
   * @returns {Promise<BuildResult>}
   */
  static buildStyles (outputFile, mainStyleSheet, additionalFiles = []) {
    return EsbuildProcessor.buildStyleSheets(outputFile, mainStyleSheet, additionalFiles)
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
   * @param {string} targetFile
   * @return {Promise<string>}
   */
  static async createMasterSassFile (stylesheets, targetFile) {
    const masterSassFile = targetFile + '.sass'
    let masterSassFileContent = ''

    for (const stylesheet of stylesheets) {
      masterSassFileContent += `@use '${stylesheet}' as *\n`
    }

    await FileUtils.writeFile(masterSassFile, masterSassFileContent)
    return masterSassFile
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
