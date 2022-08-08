#! /usr/bin/env node
import esbuild from 'esbuild'
import { sassPlugin } from 'esbuild-sass-plugin'
import { lessLoader } from 'esbuild-plugin-less'
import { dirname } from 'path'

const { build, BuildResult } = esbuild

class esbuildProcessor {

  /**
   * Build JavaScript files for a section or snippet
   * @param {string} outputFile
   * @param {string} mainJavaScriptFile
   * @param {string[]} injectedFiles
   * @returns {Promise<BuildResult>}
   */
  static async buildJavaScript (outputFile, mainJavaScriptFile, injectedFiles) {
    const options = {
      bundle: true,
      charset: 'utf8',
      //drop: ['console'], // TODO: Check with Team to see if we want to use this feature for bundled code or not.
      entryPoints: [mainJavaScriptFile],
      //metafile: true,
      //minify: true,  // TODO: Check with Team to see if we want to use this feature for bundled code or not.
      outfile: outputFile,
      platform: 'browser',
      sourcemap: true,
      target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
    }

    if (injectedFiles) {
      options.inject = injectedFiles
    }

    return build(options)
  }

  /**
   * Builds Stylesheets for a section/snippet component
   * @param {string} outputFile
   * @param {string} mainStyleSheet
   * @param {string[]} additionalSheets
   * @returns {Promise<BuildResult>}
   */
  static async buildStyleSheets (outputFile, mainStyleSheet, additionalSheets) {
    const options = {
      bundle: true,
      charset: 'utf8',
      entryPoints: [mainStyleSheet],
      //metafile: true,
      //minify: true, // TODO: Check with Team to see if we want to use this feature for bundled code or not.
      platform: 'browser',
      plugins: [sassPlugin(), lessLoader()],
      sourcemap: true,
      target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
    }

    // Injected files is not available for CSS files, hence we will have multiple output files if we have additional stylesheets provided
    if (additionalSheets.length > 0) {
      options.entryPoints = [mainStyleSheet].concat(additionalSheets)
      options.outdir = dirname(outputFile)
    } else {
      options.entryPoints = [mainStyleSheet]
      options.outfile = outputFile
    }

    return build(options)
  }

}

export default esbuildProcessor