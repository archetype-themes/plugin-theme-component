// NodeJS core modules
import { join, basename } from 'node:path'

// External Modules
import { rollup } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import multi from '@rollup/plugin-multi-entry'

import merge from 'deepmerge'

// Internal modules
import FileUtils from '../../../utils/FileUtils.js'
import logger from '../../../utils/Logger.js'

// TODO: rename class, behavior should not be tied to a specific bundler
class EsbuildProcessor {
  /**
   * Build JavaScript files for a section or snippet
   * @param {string} configFilePath
   * @param {string} outputFile
   * @param {string} mainJavaScriptFile
   * @param {string[]} [injectedFiles]
   * @returns {Promise<BuildResult>}
   */
  static async buildJavaScript (configFilePath, outputFile, mainJavaScriptFile, injectedFiles) {
    const defaultOptions = {
      input: [mainJavaScriptFile, ...injectedFiles],
      output: {
        dir: outputFile.substring(0, outputFile.lastIndexOf('/'))
      },
      plugins: [
        // Teach Rollup how to find modules in the node_modules folder
        nodeResolve(),
        // Teach Rollup how to handle multiple entry points for the same bundle
        multi({
          entryFileName: basename(outputFile)
        })
      ]
    }

    // TODO: config bundler, via rollup.config.js or archie.config.js from next
    // const esbuildConfigFile = join(configFilePath, 'esbuild.config.js')
    // logger.debug(`ESBuild Config file: ${esbuildConfigFile}`)
    // if (await FileUtils.isReadable(esbuildConfigFile)) {
    //   const configFileOptions = await import(esbuildConfigFile)
    //   /** @type {Object} **/
    //   const options = merge(defaultOptions, configFileOptions.default)
    //   logger.debug('esbuild external config file found and processed')
    //   return build(options)
    // }
    // logger.debug('No ESBuild external config file was found. Using the embedded Archie default esbuild config.')
    // return build(defaultOptions)

    // TODO: catch exceptions
    const bundle = await rollup(defaultOptions)
    return bundle.write(defaultOptions.output)
  }
}

export default EsbuildProcessor
