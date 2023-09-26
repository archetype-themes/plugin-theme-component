import SnippetFiles from '../models/SnippetFiles.js'
import ComponentFilesUtils from '../utils/ComponentFilesUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import LocaleUtils from '../utils/LocaleUtils.js'

class ComponentFactory {
  /**
   * Initialize Component
   * @param {Component} component
   * @returns {Promise<Component>}
   */
  static async initializeComponent (component) {
    // Index Snippet Files
    component.files = await ComponentFilesUtils.indexFiles(component.name, component.rootFolder, new SnippetFiles())

    // Load Liquid Code
    component.liquidCode = await ComponentFilesUtils.getLiquidCode(component.name, component.files.liquidFiles)

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
