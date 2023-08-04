// External Modules
import esbuild from 'esbuild'

// Internal Modules
import FileMissingError from '../../errors/FileMissingError.js'
import InputFileError from '../../errors/InputFileError.js'
import logger from '../../utils/Logger.js'
import FileUtils from '../../utils/FileUtils.js'
import EsbuildProcessor from './javascript/EsbuildProcessor.js'

// eslint-disable-next-line no-unused-vars
const { BuildResult } = esbuild

class JavaScriptProcessor {
  /**
   * This is simply a wrapper for the EsbuildProcessor for now
   * @param {string} collectionRootFolder
   * @param {string} outputFile
   * @param {string} mainJavaScriptFile
   * @param {string[]} [injectedFiles]
   * @returns {Promise<BuildResult>}
   */
  static async buildJavaScript (collectionRootFolder, outputFile, mainJavaScriptFile, injectedFiles = []) {
    return EsbuildProcessor.buildJavaScript(collectionRootFolder, outputFile, mainJavaScriptFile, injectedFiles)
  }
}

export default JavaScriptProcessor
