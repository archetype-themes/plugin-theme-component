import ImportMapProcessor from './javascript/ImportMapProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import FileMissingError from '../errors/FileMissingError.js'

class JavaScriptProcessor {
  /**
   * @param {string[]} jsFiles
   * @param {string} outputFile
   * @param {string} rootFolder
   * @param {string} assetsFolder
   */
  static async buildJavaScript (jsFiles, outputFile, rootFolder, assetsFolder) {
    const importMapFile = ImportMapProcessor.ImportMapFile

    if (await FileUtils.exists(importMapFile)) {
      return ImportMapProcessor.build(jsFiles, outputFile, rootFolder, assetsFolder)
    }

    throw new FileMissingError('ImportMap file not found, unable to process javascript')
  }
}

export default JavaScriptProcessor
