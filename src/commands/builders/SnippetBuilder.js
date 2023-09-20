import LocaleUtils from '../../utils/LocaleUtils.js'
import SectionSchemaUtils from '../../utils/SectionSchemaUtils.js'
import SnippetBuild from '../../models/SnippetBuild.js'
import SvgProcessor from '../../processors/SvgProcessor.js'

class SnippetBuilder {
  /**
   * Builds Snippet Components As Needed
   * @param {Snippet} snippet
   * @return {Promise<Snippet>}
   */
  static async build (snippet) {
    snippet.build = new SnippetBuild()

    // Build Locales
    snippet.build.locales = LocaleUtils.buildLocales(snippet.name, snippet.locales, snippet.schema?.locales, true)
    snippet.build.schemaLocales = LocaleUtils.buildLocales(snippet.name, snippet.schemaLocales, null, true)

    // Build Schema
    if (snippet.schema) {
      snippet.build.schema = SectionSchemaUtils.build(snippet.schema)
    }

    // Build Liquid Code
    snippet.build.liquidCode = await this.buildLiquid(snippet.name, snippet.liquidCode)

    // Build recursively

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
