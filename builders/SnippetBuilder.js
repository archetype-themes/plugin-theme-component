import FileUtils from '../utils/FileUtils.js'
import { basename } from 'path'
import ComponentBuilder from './ComponentBuilder.js'

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
   *Copy Snippet Locales
   * @param {Snippet} snippet
   */
  static copyLocales (snippet) {
    snippet.files.localeFiles.forEach(file => FileUtils.copyFileOrDie(file, `${snippet.build.localesFolder}/${basename(file)}`))
  }

}

export default SnippetBuilder
