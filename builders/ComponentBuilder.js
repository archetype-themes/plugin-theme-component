import logger from '../utils/Logger.js'
import FileUtils from '../utils/FileUtils.js'
import { writeFile } from 'node:fs/promises'

class ComponentBuilder {
  /**
   *
   * @param {Section|Snippet} component
   * @returns {Promise<void>}
   */
  static async buildLiquid (component) {

    // append component schema
    if (component.files.schemaFile) {
      logger.debug(`${component.name}: Processing Schema file`)
      component.liquidCode += `\n{% schema %}\n${await FileUtils.getFileContents(component.files.schemaFile)}\n{% endschema %}`
      logger.debug(`${component.name}: Schema file build complete`)
    }

    // Write component liquidFiles file
    await writeFile(component.build.liquidFile, component.liquidCode)
  }

}

export default ComponentBuilder
