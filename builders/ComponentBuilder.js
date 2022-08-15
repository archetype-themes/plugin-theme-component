import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import logger from '../utils/Logger.js'
import { exit } from 'node:process'
import StylesProcessor from '../processors/StylesProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import { writeFile } from 'node:fs/promises'

class ComponentBuilder {
  /**
   * Build Javascript
   * @param {Section|Snippet} component
   * @returns {Promise<void>}
   */
  static async buildJavascript (component) {
    try {
      const mainJavaScriptFile = JavaScriptProcessor.getMainJavascriptFile(component.files.javascriptFiles)
      await JavaScriptProcessor.buildJavaScript(`${component.build.assetsFolder}/${component.name}.js`, mainJavaScriptFile)
    } catch (error) {
      logger.error(error)
      exit(1)
    }
  }

  static async buildLiquid (section) {

    // append section schema
    if (section.files.schemaFile) {
      logger.debug(`${section.name}: Processing Schema file`)

      section.liquidCode += `\n{% schema %}\n${await FileUtils.readFileOrDie(section.files.schemaFile)}\n{% endschema %}`

      logger.debug(`${section.name}: Schema file build complete`)
    }

    // Write section liquidFiles file
    const liquidBuildFile = `${section.build.rootFolder}/${section.name}.liquid`
    await writeFile(liquidBuildFile, section.liquidCode)
  }

  /**
   *
   * @param {Section|Snippet}component
   */
  static async buildStylesheets (component) {
    try {
      const mainStyleSheet = StylesProcessor.getMainStyleSheet(component.files.stylesheets)
      await StylesProcessor.buildStyles(`${component.build.assetsFolder}/${component.name}.css`, mainStyleSheet)
    } catch (error) {
      logger.error(error)
      exit(1)
    }
  }
}

export default ComponentBuilder
