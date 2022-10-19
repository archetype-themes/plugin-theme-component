import { copyFile } from 'node:fs/promises'
import { basename } from 'path'
import ComponentBuilder from './ComponentBuilder.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'

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
    snippet.liquidCode = `<script src="{{ '${basename(snippet.build.javascriptFile)}' | asset_url }}" async></script>\n${snippet.liquidCode}`
  }

  /**
   * Build Snippet Main Stylesheet
   * @param {Snippet} snippet
   * @returns {Promise<void>}
   */
  static async buildStylesheets (snippet) {
    await StylesProcessor.buildStyles(snippet.build.stylesheet, snippet.files.mainStylesheet)
    snippet.liquidCode = `<link type="text/css" href="{{ '${basename(snippet.build.stylesheet)}' | asset_url }}" rel="stylesheet">\n${snippet.liquidCode}`
  }

  /**
   *Copy Snippet Locales
   * @param {Snippet} snippet
   */
  static copyLocales (snippet) {
    snippet.files.localeFiles.forEach(file => copyFile(file, `${snippet.build.localesFolder}/${basename(file)}`))
  }
}

export default SnippetBuilder
