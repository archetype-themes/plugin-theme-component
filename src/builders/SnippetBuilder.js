import { copyFile } from 'node:fs/promises'
import { basename } from 'path'
import ComponentBuilder from './ComponentBuilder.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import logger from '../utils/Logger.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import ComponentUtils from '../utils/ComponentUtils.js'

class SnippetBuilder extends ComponentBuilder {

  /**
   * Build Snippet
   * @param {Snippet} snippet
   * @returns {Promise<void>}
   */
  static async build (snippet) {
    await this.buildJavascript(snippet)
    await this.buildStylesheets(snippet)
    this.copyLocales(snippet)

    await this.buildLiquid(snippet)

  }

  /**
   * Build Snippet Javascript Index File
   * @param {Snippet} snippet
   * @returns {Promise<void>}
   */
  static async buildJavascript (snippet) {
    await JavaScriptProcessor.buildJavaScript(snippet.build.javascriptFile, snippet.files.javascriptIndex)
    snippet.liquidCode =
      `<script src="{{ '${basename(snippet.build.javascriptFile)}' | asset_url }}" async></script>\n${snippet.liquidCode}`
  }

  /**
   * Build Snippet Main Stylesheet
   * @param {Snippet} snippet
   * @returns {Promise<void>}
   */
  static async buildStylesheets (snippet) {
    await StylesProcessor.buildStyles(snippet.build.stylesheet, snippet.files.mainStylesheet)
    snippet.liquidCode =
      `<link type="text/css" href="{{ '${basename(snippet.build.stylesheet)}' | asset_url }}" rel="stylesheet">\n${snippet.liquidCode}`
  }

  /**
   *Copy Snippet Locales
   * @param {Snippet} snippet
   */
  static copyLocales (snippet) {
    snippet.files.localeFiles.forEach(file => copyFile(file, `${snippet.build.localesFolder}/${basename(file)}`))
  }

  /**
   *
   * @param {Snippet} snippet
   * @param {string} snippetsFolder
   * @return {Promise<void>}
   */
  static async processRenders (snippet, snippetsFolder) {
    logger.debug(`Processing section's "render" tags`)

    for (const render of snippet.renders) {
      if (render.snippet.renders) {
        await this.processRenders(render.snippet, snippetsFolder)
      }

      if (render.hasForClause()) {
        // Copy snippet liquid files since we can't inline a for loop
        await FileUtils.writeFile(`${snippetsFolder}/${render.snippet.name}.liquid`, render.snippet.liquidCode)
      } else {
        // Prepends variables creation to accompany liquid code injection
        let snippetLiquidCode = await LiquidUtils.getSnippetInlineLiquidCode(render)
        snippet.liquidCode = snippet.liquidCode.replace(render.liquidTag, snippetLiquidCode)
      }

      await ComponentUtils.mergeSnippetData(snippet, render.snippet)
    }
  }
}

export default SnippetBuilder
