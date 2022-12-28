// NodeJS Imports
import { mkdir } from 'node:fs/promises'

// External Modules imports
// Internal Modules
import StylesUtils from './StylesUtils.js'

class ComponentUtils {

  /**
   *
   * @param {Section|Snippet} component
   * @return {Promise<void>}
   */
  static async createFolderStructure (component) {
    await mkdir(`${component.rootFolder}/src/locales`, { recursive: true })
    await mkdir(`${component.rootFolder}/src/scripts`, { recursive: true })
    await mkdir(`${component.rootFolder}/src/styles`, { recursive: true })
    await mkdir(`${component.rootFolder}/src/snippets`, { recursive: true })
  }

  /**
   * Get Component Main Stylesheet
   * @param {Component} component
   */
  static getMainStylesheet (component) {
    if (component.files.mainStylesheet) {
      if (StylesUtils.isSassFile(component.files.mainStylesheet)) {
        return component.build.stylesheet
      } else {
        return component.files.mainStylesheet
      }
    }

  }

}

export default ComponentUtils
