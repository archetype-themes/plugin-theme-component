import SnippetBuild from '../models/SnippetBuild.js'
import SvgProcessor from '../processors/SvgProcessor.js'

class SnippetBuilder {
  /**
   * Builds Snippet Components As Needed
   * @param {Snippet} snippet
   * @return {Promise<Snippet>}
   */
  static async build (snippet) {
    snippet.build = new SnippetBuild()
    snippet.build.liquidCode = await this.buildLiquid(snippet.name, snippet.liquidCode)

    return snippet
  }

  /**
   * Build Liquid Code
   * @param {string} snippetName
   * @param {string} snippetLiquidCode
   * @return {Promise<string>}
   */
  static async buildLiquid (snippetName, snippetLiquidCode) {
    if (snippetName.startsWith('icon-') || snippetName.endsWith('-svg') || snippetName.endsWith('.svg')) {
      return SvgProcessor.buildSvg(snippetName, snippetLiquidCode)
    }
    return snippetLiquidCode
  }
}

export default SnippetBuilder
