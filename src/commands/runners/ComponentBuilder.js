import ComponentBuild from '../../models/ComponentBuild.js'
import LiquidUtils from '../../utils/LiquidUtils.js'
import LocaleUtils from '../../utils/LocaleUtils.js'

class ComponentBuilder {
  /**
   *
   * @param {Component} component
   * @param {string} collectionRootFolder
   * @returns {Promise<Component>}
   */
  static async build (component, collectionRootFolder) {
    // Create build model
    component.build = new ComponentBuild()

    // Build Locales
    component.build.locales = LocaleUtils.buildLocales(component.name, component.locales, true)

    // Build Liquid Code
    component.build.liquidCode = await LiquidUtils.buildLiquid(component.name, component.liquidCode, collectionRootFolder)

    return component
  }
}

export default ComponentBuilder
