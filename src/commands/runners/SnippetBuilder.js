import ComponentBuild from '../../models/ComponentBuild.js'
import LiquidUtils from '../../utils/LiquidUtils.js'
import LocaleUtils from '../../utils/LocaleUtils.js'

class SnippetBuilder {
  /**
   * Builds Snippet Components As Needed
   * @param {Snippet} snippet
   * @return {Promise<Snippet>}
   */
  static async build (snippet) {
    // Create build model
    snippet.build = new ComponentBuild()

    // Build Locales
    snippet.build.locales = LocaleUtils.buildLocales(snippet.name, snippet.locales, snippet.schema?.locales, true)

    // Build Liquid Code
    snippet.build.liquidCode = await LiquidUtils.buildLiquid(snippet.name, snippet.liquidCode)

    return snippet
  }
}

export default SnippetBuilder
