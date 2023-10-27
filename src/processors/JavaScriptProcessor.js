import ImportMapProcessor from './javascript/ImportMapProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import FileMissingError from '../errors/FileMissingError.js'

class JavaScriptProcessor {
  /**
   * This is a wrapper for a JavaScript Processor
   * @param {string[]} jsFiles
   * @param {string} outputFile
   * @param {string} collectionRootFolder
   * @param {string} assetsFolder
   * @throws {FileMissingError}
   */
  static async buildJavaScript (jsFiles, outputFile, collectionRootFolder, assetsFolder) {
    const importMapFile = ImportMapProcessor.ImportMapFile

    if (await FileUtils.exists(importMapFile)) {
      return ImportMapProcessor.build(jsFiles, outputFile, collectionRootFolder, assetsFolder)
    }

    throw new FileMissingError('ImportMap file not found, unable to process javascript')
  }
}

export default JavaScriptProcessor
