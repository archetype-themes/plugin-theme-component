import ComponentBuild from '../models/ComponentBuild.js'
import SvgProcessor from '../processors/SvgProcessor.js'
import { FileTypes, getCopyright } from '../utils/ComponentFilesUtils.js'

class ComponentBuilder {
  /**
   * Build An Individual Component
   * @param {Component} component
   * @param {string} collectionRootFolder
   * @param {string} [copyright] copyright Text
   * @returns {Promise<Component>}
   */
  static async build(component, collectionRootFolder, copyright) {
    // Create the component build model
    component.build = new ComponentBuild()

    // Build Liquid Code
    if (component.isSvg()) {
      component.build.liquidCode = await SvgProcessor.buildSvg(
        component.name,
        component.liquidCode,
        collectionRootFolder
      )
      if (copyright) {
        component.build.liquidCode = getCopyright(FileTypes.Svg, copyright) + component.build.liquidCode
      }
    } else {
      component.build.liquidCode = component.liquidCode
      if (copyright) {
        component.build.liquidCode = getCopyright(FileTypes.Liquid, copyright) + component.build.liquidCode
      }
    }

    return component
  }
}

export default ComponentBuilder
