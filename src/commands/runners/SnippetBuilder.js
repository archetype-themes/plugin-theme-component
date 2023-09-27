import ComponentBuild from '../../models/ComponentBuild.js'
import LiquidUtils from '../../utils/LiquidUtils.js'
import LocaleUtils from '../../utils/LocaleUtils.js'
import SectionSchemaUtils from '../../utils/SectionSchemaUtils.js'

class SnippetBuilder {
  /**
   * Builds Snippet Components As Needed
   * @param {Snippet} snippet
   * @return {Promise<Snippet>}
   */
  static async build (snippet) {
    snippet.build = new ComponentBuild()

    // Build Locales
    snippet.build.locales = LocaleUtils.buildLocales(snippet.name, snippet.locales, snippet.schema?.locales, true)
    snippet.build.schemaLocales = LocaleUtils.buildLocales(snippet.name, snippet.schemaLocales, null, true)

    // Build Schema
    if (snippet.schema) {
      snippet.build.schema = SectionSchemaUtils.build(snippet.schema)
    }

    // Build Liquid Code
    snippet.build.liquidCode = await LiquidUtils.buildLiquid(snippet.name, snippet.liquidCode)

    return snippet
  }
}

export default SnippetBuilder
