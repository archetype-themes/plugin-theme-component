import { unlink } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import ImportMapProcessor from './javascript/ImportMapProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import FileMissingError from '../errors/FileMissingError.js'
import JavascriptUtils from '../utils/JavascriptUtils.js'
import EsbuildProcessor from './javascript/EsbuildProcessor.js'

class JavaScriptProcessor {
  /**
   * This is a wrapper for a JavaScript Processor
   * @param {string[]} jsFiles
   * @param {string} outputFile
   * @param {string} collectionRootFolder
   * @param {string} jsProcessor
   * @throws {FileMissingError}
   */
  static async buildJavaScript (jsFiles, outputFile, collectionRootFolder, jsProcessor) {
    if (jsProcessor === 'esbuild') {
      const jsBundleIndexFile = path.join(os.tmpdir(), 'jsBundleIndex.js')
      const jsBundleIndexFileContents = JavascriptUtils.generateJsBundleIndex(jsFiles)
      await FileUtils.writeFile(jsBundleIndexFile, jsBundleIndexFileContents)

      const buildResult = await EsbuildProcessor.buildJavaScript(jsBundleIndexFile, outputFile, collectionRootFolder)
      await unlink(jsBundleIndexFile)
      return buildResult
    }

    const importMapFile = ImportMapProcessor.ImportMapFile

    if (await FileUtils.exists(path.join(collectionRootFolder, importMapFile))) {
      return ImportMapProcessor.build(new Set(jsFiles), outputFile, collectionRootFolder)
    }

    throw new FileMissingError('ImportMap file not found, unable to process javascript')
  }
}

export default JavaScriptProcessor
