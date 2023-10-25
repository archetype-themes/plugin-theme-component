// Archie Imports
import ComponentBuild from '../../models/ComponentBuild.js'
import LiquidUtils from '../../utils/LiquidUtils.js'
import LocaleUtils from '../../utils/LocaleUtils.js'
import SectionSchemaUtils from '../../utils/SectionSchemaUtils.js'
import SnippetUtils from '../../utils/SnippetUtils.js'

class SectionBuilder {
  /**
   * Build Section
   * @param {Section} section - The Section model instance
   * @returns {Promise<Section>}
   */
  static async build (section) {
    // Create build model
    section.build = new ComponentBuild()

    // Build Locales
    section.build.locales = LocaleUtils.buildLocales(section.name, section.locales, section.schema?.locales)

    // Build Section Schema (this includes previously collated locales through factory methods
    const snippetsSchema = SnippetUtils.buildSectionSchemaRecursively(section.snippets)
    if (section.schema || snippetsSchema) {
      section.build.schema = SectionSchemaUtils.build(section.schema, snippetsSchema)
    }

    section.build.liquidCode = await LiquidUtils.buildLiquid(section.name, section.liquidCode, section.build.schema)

    return section
  }
}

export default SectionBuilder
