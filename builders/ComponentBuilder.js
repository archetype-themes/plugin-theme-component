import logger from '../utils/Logger.js'
import StylesProcessor from '../processors/StylesProcessor.js'
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

      component.liquidCode += `\n{% schema %}\n${await FileUtils.readFileOrDie(component.files.schemaFile)}\n{% endschema %}`

      logger.debug(`${component.name}: Schema file build complete`)
    }

    // Write component liquidFiles file
    const liquidBuildFile = `${component.build.rootFolder}/${component.name}.liquid`
    await writeFile(liquidBuildFile, component.liquidCode)
  }

  /**
   *
   * @param {Section|Snippet} component
   */
  static async buildStylesheets (component) {
    await StylesProcessor.buildStyles(component.build.stylesheet, component.files.mainStylesheet)
  }
}

export default ComponentBuilder
