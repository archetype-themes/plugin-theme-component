// Node JS internal imports
import { unlink } from 'node:fs/promises'
import path from 'path'
import CollectionUtils from '../utils/CollectionUtils.js'
// Archie Internal imports
import PostCssProcessor from './style-processors/PostCssProcessor.js'
import SassPreProcessor from './style-processors/SassPreProcessor.js'
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
    }

    const css = await FileUtils.getFileContents(sourceFile)

    const postCssConfigFile = await CollectionUtils.findPostCssConfigFile()
    if (await FileUtils.isReadable(postCssConfigFile)) {
      const postCssConfig = await import(postCssConfigFile)
      return PostCssProcessor.processStyles(css, sourceFile, outputFile, postCssConfig.default.plugins)
    }

    return css
  }

  /**
   * Create Styles Bundle
   * @param {string[]} stylesheets
   * @param {string} outputFile
   * @param {string} [collectionName]
   * @return {Promise<string>}
   */
  static async buildStylesBundle (stylesheets, outputFile, collectionName) {
    const masterStylesheet = path.join(os.tmpdir(), 'masterStylesheet.css')
    const masterStylesheetContents = StylesUtils.createMasterStylesheet(stylesheets)

    await FileUtils.writeFile(masterStylesheet, masterStylesheetContents)

    const postCssConfigFile = await CollectionUtils.findPostCssConfigFile(collectionName)
    if (postCssConfigFile) {
      const postCssConfig = await import(postCssConfigFile)
      const css = await PostCssProcessor.processStyles(masterStylesheetContents, masterStylesheet, outputFile, postCssConfig.default)
      await unlink(masterStylesheet)
      return css
    }

    throw new Error('PostCSS config file not found')
  }
}

export default StylesProcessor
