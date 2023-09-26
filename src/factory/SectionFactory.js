// Node.js Internal imports
import path from 'path'

// Archie Internal JS imports
import Components from '../config/Components.js'
import Section from '../models/Section.js'
import SectionFiles from '../models/SectionFiles.js'
import Session from '../models/static/Session.js'
import ComponentFilesUtils from '../utils/ComponentFilesUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import LocaleUtils from '../utils/LocaleUtils.js'
import logger from '../utils/Logger.js'
import NodeUtils from '../utils/NodeUtils.js'
import SnippetFactory from './SnippetFactory.js'

class SectionFactory {
  /**
   * Builds a new Section and sets its basic parameters
   * @param {string} name - Section name
   * @param {string} [collectionRootFolder] - Parent Collection Root Folder
   * @returns {Promise<Section>}
   */
  static async fromName (name, collectionRootFolder) {
    let section = new Section()
    section.name = name

    // Set root folder
    if (collectionRootFolder) {
      section.rootFolder = path.join(collectionRootFolder, Components.SECTIONS_FOLDER_NAME, section.name)
    } else if (Session.isSection()) {
      section.rootFolder = NodeUtils.getPackageRootFolder()
    }

    section = this.initializeSection(section)

    // Create Snippets Recursively
    if (section.snippetNames.length) {
      logger.info(`└─> Section ${section.name} has the following snippets: ${section.snippetNames.join(', ')} `)
      const snippetsPath = path.join(section.rootFolder, '../../', Components.SNIPPETS_FOLDER_NAME)
      section.snippets = await SnippetFactory.fromNames(section.snippetNames, snippetsPath, section.files.snippetFiles)
    }
  }

  /**
   * Initialize Section
   * @param {Section} section
   * @returns {Promise<Section>}
   */
  static async initializeSection (section) {
    // Index Section Files
    section.files = await ComponentFilesUtils.indexFiles(section.name, section.rootFolder, new SectionFiles())

    // Load Liquid Code
    section.liquidCode = await ComponentFilesUtils.getLiquidCode(section.name, section.files.liquidFiles)

    // Load Schema
    if (section.files.schemaFile) {
      section.schema = await ComponentFilesUtils.getSectionSchema(section.files.schemaFile)
    }

    // Load Locales
    if (section.files.localeFiles?.length) {
      section.locales = await LocaleUtils.parseLocaleFilesContent(section.files.localeFiles)
    }

    // Load Schema Locales
    if (section.files.schemaLocaleFiles?.length) {
      section.schemaLocales = await LocaleUtils.parseLocaleFilesContent(section.files.schemaLocaleFiles)
    }

    // Load Settings Schema
    if (section.files.settingsSchemaFile) {
      section.settingsSchema = await ComponentFilesUtils.getSettingsSchema(section.files.settingsSchemaFile)
    }

    section.snippetNames = LiquidUtils.getSnippetNames(section.liquidCode)

    return section
  }

  /**
   * Create Sections from a Collection
   * @param {Section[]} sections
   * @param {string[]} [sectionNames]
   * @return {Promise<Section[]>}
   */
  static async fromCollection (sections, sectionNames) {
    const filteredSections = []
    const filterWithNames = !!(sectionNames && sectionNames.length)
    // Create sections
    for (const section of sections) {
      // Skip entry if we are filtering and that the section name is not present in the list
      if (filterWithNames && !sectionNames.includes(section.name)) { continue }

      filteredSections.push(await SectionFactory.initializeSection(section))
    }
    return filteredSections
  }
}

export default SectionFactory
