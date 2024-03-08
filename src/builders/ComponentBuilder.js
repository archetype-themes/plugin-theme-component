import ComponentBuild from '../models/ComponentBuild.js'
import SvgProcessor from '../processors/SvgProcessor.js'

class ComponentBuilder {
  /**
   *
   * @param {Component} component
   * @param {string} collectionRootFolder
   * @returns {Promise<Component>}
   */
  static async build(component, collectionRootFolder) {
    // Create the component build model
    component.build = new ComponentBuild()

    // Build Liquid Code
    if (component.isSvg()) {
      component.build.liquidCode = await SvgProcessor.buildSvg(
        component.name,
        component.liquidCode,
        collectionRootFolder
      )
    } else {
      component.build.liquidCode = component.liquidCode
    }

    return component
  }
}

export default ComponentBuilder
