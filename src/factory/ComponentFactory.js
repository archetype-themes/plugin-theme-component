import ComponentFiles from '../models/ComponentFiles.js'
import ComponentFilesUtils from '../utils/ComponentFilesUtils.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import LocaleUtils from '../utils/LocaleUtils.js'

class ComponentFactory {
  /**
   * Initialize Component
   * @param {Component|Section|Snippet} component
   * @returns {Promise<Component|Section|Snippet>}
   */
  static async initializeComponent (component) {
    // Index Snippet Files
    component.files = await ComponentFilesUtils.indexFiles(component.name, component.rootFolder, new ComponentFiles())

    // Load Liquid Code
    component.liquidCode = await FileUtils.getFileContents(component.files.liquidFile)

    // Load Schema
    if (component.files.schemaFile) {
      component.schema = await ComponentFilesUtils.getSectionSchema(component.files.schemaFile)
    }

    // Load Locales
    if (component.files.localeFiles?.length) {
      component.locales = await LocaleUtils.parseLocaleFilesContent(component.files.localeFiles)
    }

    // Load Schema Locales
    if (component.files.schemaLocaleFiles?.length) {
      component.schemaLocales = await LocaleUtils.parseLocaleFilesContent(component.files.schemaLocaleFiles)
    }

    // Load Settings Schema
    if (component.files.settingsSchemaFile) {
      component.settingsSchema = await ComponentFilesUtils.getSettingsSchema(component.files.settingsSchemaFile)
    }

    // Find snippet names in render tags
    component.snippetNames = LiquidUtils.getSnippetNames(component.liquidCode)

    return component
  }
}

export default ComponentFactory
