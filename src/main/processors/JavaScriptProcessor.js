// External Modules
import esbuild from 'esbuild'
import { unlink } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import FileUtils from '../../utils/FileUtils.js'
import JavascriptUtils from '../../utils/JavascriptUtils.js'

// Internal Modules
import EsbuildProcessor from './javascript/EsbuildProcessor.js'

// eslint-disable-next-line no-unused-vars
const { BuildResult, BuildOptions } = esbuild

class JavaScriptProcessor {

  /**
   * This is simply a wrapper for the EsbuildProcessor for now
   * @param {string[]} javascriptFiles
   * @param {string} outputFile
   * @param {string} collectionRootFolder
   * @return {Promise<BuildResult<BuildOptions>>}
   */
  static async buildJavaScript (javascriptFiles, outputFile, collectionRootFolder) {
    const jsBundleIndexFile = path.join(os.tmpdir(), 'jsBundleIndex.js')
    const jsBundleIndexFileContents = JavascriptUtils.generateJsBundleIndex(javascriptFiles)
    await FileUtils.writeFile(jsBundleIndexFile, jsBundleIndexFileContents)

    const buildResult = await EsbuildProcessor.buildJavaScript(jsBundleIndexFile, outputFile, collectionRootFolder)
    await unlink(jsBundleIndexFile)
    return buildResult
  }
}

export default JavaScriptProcessor
