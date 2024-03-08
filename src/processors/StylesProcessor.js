// Node.js internal imports
import { unlink } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

// Internal Imports
import PostCssProcessor from './styles/PostCssProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import StylesUtils from '../utils/StylesUtils.js'

class StylesProcessor {
  /**
   * Create Styles Bundle
   * @param {string[]} stylesheets
   * @param {string} outputFile
   * @return {Promise<string>}
   */
  static async buildStylesBundle(
    stylesheets,
    outputFile
  ) {
    const masterStylesheet = path.join(os.tmpdir(), 'masterStylesheet.css')
    const masterStylesheetContents =
      StylesUtils.createMasterStylesheet(stylesheets)

    await FileUtils.saveFile(masterStylesheet, masterStylesheetContents)
    const css = await PostCssProcessor.processStyles(
      masterStylesheetContents,
      masterStylesheet,
      outputFile
    )
    await unlink(masterStylesheet)
    return css
  }
}

export default StylesProcessor
