import esbuild from 'esbuild'
import { basename } from 'path'
import ComponentBuilder from './ComponentBuilder.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import FileUtils from '../utils/FileUtils.js'

const { BuildResult } = esbuild

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

    await this.buildLiquid()

  }

  /**
   * Build Snippet Javascript
   * @param {Snippet} snippet
   * @returns {Promise<BuildResult>}
   */
  static async buildJavascript (snippet) {
    return JavaScriptProcessor.buildJavaScript(`${snippet.build.assetsFolder}/${snippet.name}.js`, snippet.files.javascriptIndex)
  }

  /**
   *Copy Snippet Locales
   * @param {Snippet} snippet
   */
  static copyLocales (snippet) {
    snippet.files.localeFiles.forEach(file => FileUtils.copyFileOrDie(file, `${snippet.build.localesFolder}/${basename(file)}`))
  }

}

export default SnippetBuilder
