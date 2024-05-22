import ImportMapProcessor from './javascript/ImportMapProcessor.js'
import { exists } from '../utils/FileUtils.js'
import FileMissingError from '../errors/FileMissingError.js'
import path from 'path'

class JavaScriptProcessor {
  /**
   * This is a wrapper for a JavaScript Processor
   * @param {string[]} jsFiles
   * @param {string} outputFile
   * @param {string} collectionRootFolder
   * @return {Map<string, string>}
   * @throws {FileMissingError}
   */
  static async buildJavaScript(jsFiles, outputFile, collectionRootFolder) {
    const importMapFile = ImportMapProcessor.ImportMapFile

    if (await exists(path.join(collectionRootFolder, importMapFile))) {
      return ImportMapProcessor.build(new Set(jsFiles), outputFile, collectionRootFolder)
    }

    throw new FileMissingError('ImportMap file not found, unable to process javascript')
  }
}

export default JavaScriptProcessor
