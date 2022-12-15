// Node JS internal imports
import { unlink } from 'node:fs/promises'
import path from 'path'
// Archie Internal imports
import PostCssProcessor from './PostCssProcessor.js'
import SassPreProcessor from './SassPreProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import os from 'os'
import StylesUtils from '../utils/StylesUtils.js'

class StylesProcessor {
  /**
   * Process Styles by using all appropriate style preprocessors
   * @param {string} sourceFile
   * @param {string} outputFile
   * @returns {Promise<string>} Final styles
   */
  static async buildStyles (sourceFile, outputFile) {
    if (StylesUtils.isSassFile(sourceFile)) {
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
    const masterStylesheetContents = StylesUtils.createMasterStylesheet(stylesheets)

    await FileUtils.writeFile(masterStylesheet, masterStylesheetContents)

    const css = await PostCssProcessor.processStyles(masterStylesheetContents, masterStylesheet, outputFile)
    await unlink(masterStylesheet)
    return css
  }
}

export default StylesProcessor
