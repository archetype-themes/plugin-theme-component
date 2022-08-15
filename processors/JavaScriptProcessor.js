import esbuild from 'esbuild'
import esbuildProcessor from './esbuildProcessor.js'
import logger from '../utils/Logger.js'
import FileUtils from '../utils/FileUtils.js'

const { BuildResult } = esbuild

class JavaScriptProcessor {

  /**
   * This is simply a wrapper for the esbuildProcessor for now
   * @param {string} outputFile
   * @param {string} mainJavaScriptFile
   * @param {string[]} injectedFiles
   * @returns {Promise<BuildResult>}
   */
  static async buildJavaScript (outputFile, mainJavaScriptFile, injectedFiles = []) {
    return esbuildProcessor.buildJavaScript(outputFile, mainJavaScriptFile, injectedFiles)
  }

  /**
   * Finds the main or index JavaScript file within the provided file list
   * @param {string[]} files
   * @returns {string}
   * @throws Error
   */
  static findMainJavaScriptFile (files) {
    const regex = /[/\\]((?:index|main)+\.(?:js|mjs))$/i
    const matches = []
    for (const jsFile of files) {
      const match = jsFile.match(regex)
      if (match) {
        matches.push(match.input)
      }
    }

    if (matches.length === 1) {
      logger.debug(`JavaScript Entrypoint found: ${FileUtils.convertToComponentRelativePath(matches[0])}`)
      return matches[0]
    } else if (matches.length === 0) {
      throw new Error('An index or main JavaScript file could not be found.')
    }
    logger.debug(matches)
    throw new Error('Only one index or main JavaScript file is allowed but multiple matches were found.')
  }

  /**
   * Get the main/index javascript file within the provided file list
   * @param {string[]} files
   * @returns {string}
   * @throws Error
   */
  static getMainJavascriptFile (files) {
    // If there's only 1 JavaScript file, take it!
    if (files.length === 1) {
      return files[0]
    } else {
      // If we have more than one JavaScript file, try to find a single main/index file (one ring to rule them all)
      return this.findMainJavaScriptFile(files)
    }
  }

}

export default JavaScriptProcessor
