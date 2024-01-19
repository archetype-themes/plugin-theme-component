// Node.js internal imports
import { unlink } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

// Internal Imports
import LightningCssProcessor from './styles/LightningCssProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import StylesUtils from '../utils/StylesUtils.js'

class StylesProcessor {
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

    await FileUtils.saveFile(masterStylesheet, masterStylesheetContents)
    const { code } = LightningCssProcessor.processStyles(masterStylesheet)
    await unlink(masterStylesheet)
    return code.toString()
  }
}

export default StylesProcessor
