import logger from '../utils/Logger.js'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import merge from 'deepmerge'
import SectionBuild from '../models/SectionBuild.js'

class ComponentBuilder {
  /**
   * Build Component Liquid File
   * @param {Section|Snippet} component
   * @returns {Promise<void>}
   */
  static async buildLiquid (component) {
    logger.debug(`${component.name}: Building Liquid file`)

    // append component schema
    if (component.schema) {
      logger.debug(`${component.name}: Processing Schema`)

      if (component.locales) {
        /** @type {Object} component.schema.locales */
        if (component.schema.locales) {
          component.schema.locales = merge(component.schema.locales, component.locales)
          // Resulting merge is copied back to the component.locales property, just in case
          component.locales = component.schema.locales
        } else {
          component.schema.locales = component.locales
        }

      }

      component.liquidCode += `\n{% schema %}\n${JSON.stringify(component.schema, null, 2)}\n{% endschema %}`
      logger.debug(`${component.name}: Schema file build complete`)
    }

    // Write component liquidFiles file
    return writeFile(component.build.liquidFile, component.liquidCode)
  }

  /**
   *
   * @param {ComponentFiles} componentFiles
   * @param {ComponentBuild} componentBuild
   */
  static async resetBuildFolders (componentFiles, componentBuild) {
    await rm(componentBuild.rootFolder, { force: true, recursive: true })
    await mkdir(componentBuild.rootFolder, { recursive: true })

    if (componentFiles.schemaLocaleFiles.length > 0) {
      await mkdir(componentBuild.localesFolder, { recursive: true })
    }

    if (componentBuild instanceof SectionBuild && componentFiles.snippetFiles.length > 0) {
      await mkdir(componentBuild.snippetsFolder, { recursive: true })
    }

    if (componentFiles.javascriptFiles.length > 0 || componentFiles.stylesheets.length > 0) {
      await mkdir(componentBuild.assetsFolder, { recursive: true })
    }
  }
}

export default ComponentBuilder
