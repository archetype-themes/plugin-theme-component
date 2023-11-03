import ComponentBuild from '../../models/ComponentBuild.js'
import LiquidUtils from '../../utils/LiquidUtils.js'
import LocaleUtils from '../../utils/LocaleUtils.js'

class ComponentBuilder {
  /**
   *
   * @param {Component} component
   * @returns {Promise<Component>}
   */
  static async build (component) {
    // Create build model
    component.build = new ComponentBuild()

    // Build Locales
    component.build.locales = LocaleUtils.buildLocales(component.name, component.locales, component.schema?.locales, true)

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
    const snippetsToBuild = snippets.filter(snippet => !snippet.build)
    return Promise.all(snippetsToBuild.map(snippet => ComponentBuilder.build(snippet)))
  }
}

export default ComponentBuilder
