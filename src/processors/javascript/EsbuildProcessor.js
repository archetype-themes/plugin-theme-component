// NodeJS core modules
import { join } from 'node:path'

// External Modules
import esbuild from 'esbuild'
import merge from 'deepmerge'

// Internal modules
import FileUtils from '../../utils/FileUtils.js'
import logger from '../../utils/Logger.js'

// eslint-disable-next-line no-unused-vars
const { build, BuildResult } = esbuild

class EsbuildProcessor {
  /**
   * Build JavaScript files for a component
   * @param {string} mainJavaScriptFile
   * @param {string} outputFile
   * @param {string} configFilePath
   * @returns {Promise<BuildResult>}
   */
  static async buildJavaScript (mainJavaScriptFile, outputFile, configFilePath) {
    const defaultOptions = {
      bundle: true,
      charset: 'utf8',
      // drop: ['console'],
      entryPoints: [mainJavaScriptFile],
      // metafile: true,  // result = build(options); logger.debug(result.metafile);return result
      // minify: true,
      format: 'cjs', // Defaults to iife on browser platform, but this wraps the code inside an immediately-invoked function expression
      outfile: outputFile,
      platform: 'browser',
      sourcemap: true,
      target: ['chrome58', 'firefox57', 'safari11', 'edge18']
    }

    const esbuildConfigFile = join(configFilePath, 'esbuild.config.js')
    logger.debug(`ESBuild Config file: ${esbuildConfigFile}`)
    if (await FileUtils.isReadable(esbuildConfigFile)) {
      const options = merge(defaultOptions, (await import(esbuildConfigFile)).default)
      logger.debug('esbuild external config file found and processed')
      return build(options)
    }
    logger.debug('No ESBuild external config file was found. The CLI will use the default internal esbuild config.')
    return build(defaultOptions)
  }
}

export default EsbuildProcessor
