import logger from '../utils/Logger.js'
import { mkdir, rm, writeFile } from 'node:fs/promises'

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
      component.liquidCode += `\n{% schema %}\n${JSON.stringify(component.schema)}\n{% endschema %}`
      logger.debug(`${component.name}: Schema file build complete`)
    }

    // Write component liquidFiles file
    return writeFile(component.build.liquidFile, component.liquidCode)
  }

  /**
   *
   * @param {Section|Snippet} component
   */
  static async resetBuildFolders (component) {
    await rm(component.build.rootFolder, { force: true, recursive: true })
    await mkdir(component.build.rootFolder, { recursive: true })

    if (component.files.localeFiles.length > 0) {
      await mkdir(component.build.localesFolder, { recursive: true })
    }

    if (component.files.snippetFiles.length > 0) {
      await mkdir(component.build.snippetsFolder, { recursive: true })
    }

    if (component.files.javascriptFiles.length > 0 || component.files.stylesheets.length > 0) {
      await mkdir(component.build.assetsFolder, { recursive: true })
    }
  }
}

export default ComponentBuilder
