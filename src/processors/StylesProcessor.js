// Node JS internal imports
import { unlink } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

// Archie Internal imports
import PostCssProcessor from './styles/PostCssProcessor.js'
import SassPreProcessor from './styles/SassPreProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import StylesUtils from '../utils/StylesUtils.js'

class StylesProcessor {
  /**
   * Process Styles by using all appropriate style preprocessors
   * @param {string} sourceFile
   * @param {string} outputFile
   * @param {string} collectionRootFolder - Collection path. Will be used to look for config files
   * @returns {Promise<string>} Final styles
   */
  static async buildStyles (sourceFile, outputFile, collectionRootFolder) {
    if (StylesUtils.isSassFile(sourceFile)) {
      return SassPreProcessor.processStyleSheet(sourceFile)
    }

    const css = await FileUtils.getFileContents(sourceFile)
    return PostCssProcessor.processStyles(css, sourceFile, outputFile, collectionRootFolder)
  }

  /**
   * Create Styles Bundle
   * @param {string[]} stylesheets
   * @param {string} outputFile
   * @param {string} collectionRootFolder - Collection path. Will be used to look for config files
   * @return {Promise<string>}
   */
  static async buildStylesBundle (stylesheets, outputFile, collectionRootFolder) {
    const masterStylesheet = path.join(os.tmpdir(), 'masterStylesheet.css')
    const masterStylesheetContents = StylesUtils.createMasterStylesheet(stylesheets)

    await FileUtils.writeFile(masterStylesheet, masterStylesheetContents)
    const css = await PostCssProcessor.processStyles(masterStylesheetContents, masterStylesheet, outputFile, collectionRootFolder)
    await unlink(masterStylesheet)
    return css
  }
}

export default StylesProcessor
