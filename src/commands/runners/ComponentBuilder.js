import ComponentBuild from '../../models/ComponentBuild.js'
import LiquidUtils from '../../utils/LiquidUtils.js'
import LocaleUtils from '../../utils/LocaleUtils.js'
import SectionSchemaUtils from '../../utils/SectionSchemaUtils.js'

class ComponentBuilder {
  /**
   *
   * @param {Component} component
   * @returns {Promise<Component>}
   */
  static async build (component) {
    // Await Recursive Children Build First
    if (component.snippets?.length) {
      component.snippets = await this.recursivelyBuildChildren(component.snippets)
    }

    component.build = new ComponentBuild()

    // Build Locales
    component.build.locales = LocaleUtils.buildLocales(component.name, component.locales, component.schema?.locales, true)
    component.build.schemaLocales = LocaleUtils.buildLocales(component.name, component.schemaLocales, null, true)

    // Build Schema
    if (component.schema) {
      component.build.schema = SectionSchemaUtils.build(component.schema)
    }

    // Build Liquid Code
    component.build.liquidCode = await LiquidUtils.buildLiquid(component.name, component.liquidCode)

    return component
  }

  /**
   *
   * @param {Snippet[]}snippets
   * @returns {Promise<Snippet[]>}
   */
  static async recursivelyBuildChildren (snippets) {
    const builtSnippets = []
    for (const snippet of snippets) {
      if (!snippet.build) {
        builtSnippets.push(await ComponentBuilder.build(snippet))
      }
    }
    return builtSnippets
  }
}

export default ComponentBuilder
