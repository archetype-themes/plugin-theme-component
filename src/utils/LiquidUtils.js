import FileUtils from './FileUtils.js'
import { mkdir } from 'node:fs/promises'
import path from 'path'

class LiquidUtils {
  /**
   * Finds render tags in liquid code and create Render models
   * @param {string} liquidCode
   * @returns {RegExpMatchArray[]}
   */
  static findRenderTags (liquidCode) {
    const regex = /\{%-?\s+render\s+'(?<snippet>[\p{L}_. -]+)'(?:\s*(?<clause>for|with)\s+(?<clauseSourceVariable>\w+[.\w]+)\s+as\s+(?<clauseTargetVariable>\w+))?(?<variables>(?:\s*,\s*\w+:\s*(\w[.\w]+\w|'[^']+'))*)\s+-?%\}/giu
    return [...liquidCode.matchAll(regex)]
  }

  /**
   * Generate Javascript File Reference for Shopify Liquid Code
   * @param {string} javascriptFile - Javascript file basename
   * @param {boolean} [async=true] - Optional asynchronous load of the javascript file, defaults to true
   * @return {string}
   */
  static generateJavascriptFileReference (javascriptFile, async = true) {
    if (async) {
      return `<script src="{{ '${javascriptFile}' | asset_url }}" async></script>`
    }
    return `<script src="{{ '${javascriptFile}' | asset_url }}"></script>`
  }

  /**
   * Generate Stylesheet Reference for Shopify Liquid Code
   * @param {string} stylesheetName - stylesheet basename
   * @param {boolean} [preload=false] - Optionally preload the stylesheet, defaults to false
   * @return {string}
   */
  static generateStylesheetReference (stylesheetName, preload = false) {
    if (preload) {
      return `{{ '${stylesheetName}' | global_asset_url | stylesheet_tag: preload: ${preload} }}`
    }
    return `{{ '${stylesheetName}' | global_asset_url | stylesheet_tag }}`
  }

  /**
   * Recursively Process renders by inlining them whenever possible
   * @param {string} liquidCode
   * @param {Render[]} renders
   * @param {string} snippetsFolder
   * @returns {Promise<string>}
   */
  static async inlineOrCopySnippets (liquidCode, renders, snippetsFolder) {
    let buildLiquidCode = liquidCode
    for (const render of renders) {
      if (render.snippet.renders) {
        render.snippet.build.liquidCode =
          await this.inlineOrCopySnippets(render.snippet.liquidCode, render.snippet.renders, snippetsFolder)
      }

      // Simply copy file if we have a for loop.
      if (render.hasForClause()) {
        if (!await FileUtils.isWritable(snippetsFolder)) {
          await mkdir(snippetsFolder, { recursive: true })
        }

        // Copy snippet liquid files since we can't inline a for loop
        await FileUtils.writeFile(path.join(snippetsFolder, `${render.snippet.name}.liquid`), render.snippet.build.liquidCode)
      } else {
        // Prepends variables creation to accompany liquid code injection
        // Process "With" clause variable
        if (render.hasWithClause() && render.clauseSourceVariable !== render.clauseTargetVariable) {
          render.snippet.build.liquidCode =
            `{% assign ${render.clauseTargetVariable} = ${render.clauseSourceVariable} %}\n${render.snippet.build.liquidCode}`
        }

        // Process additional variables
        for (const renderVariable in render.variables) {
          if (renderVariable !== render.variables[renderVariable]) {
            render.snippet.build.liquidCode =
              `{% assign ${renderVariable} = ${render.variables[renderVariable]} %}\n${render.snippet.build.liquidCode}`
          }
        }

        buildLiquidCode = buildLiquidCode.replace(render.liquidTag, render.snippet.build.liquidCode)
      }
    }
    return buildLiquidCode
  }
}

export default LiquidUtils
