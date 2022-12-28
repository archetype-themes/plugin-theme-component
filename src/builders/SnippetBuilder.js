import ComponentBuilder from './ComponentBuilder.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import StylesUtils from '../utils/StylesUtils.js'

class SnippetBuilder extends ComponentBuilder {

  /**
   * Build Snippet
   * @param {Snippet} snippet
   */
  static async build (snippet) {

    if (snippet.files.mainStylesheet && StylesUtils.isSassFile(snippet.files.mainStylesheet)) {
      snippet.build.styles = await StylesProcessor.buildStyles(snippet.files.mainStylesheet, snippet.build.stylesheet)
      await FileUtils.writeFile(snippet.build.stylesheet, snippet.build.styles)
    }
  }

}

export default SnippetBuilder
