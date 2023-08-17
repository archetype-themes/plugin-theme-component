// Node.js Internal imports
import path from 'path'

// Archie Internal JS imports
import Components from '../../config/Components.js'
import ComponentFilesUtils from '../../utils/ComponentFilesUtils.js'
import FileUtils from '../../utils/FileUtils.js'
import LocaleUtils from '../../utils/LocaleUtils.js'
import NodeConfig from '../../cli/models/NodeConfig.js'
import NodeUtils from '../../utils/NodeUtils.js'
import RenderFactory from './RenderFactory.js'
import SectionFiles from '../models/SectionFiles.js'
import SnippetFactory from './SnippetFactory.js'
import Section from '../models/Section.js'

class SectionFactory {
  /**
   * Builds a new Section and sets its basic parameters
   * @param {string} name - Section name
   * @param {string} [collectionRootFolder] - Parent Collection Root Folder
   * @returns {Promise<Section>}
   */
  static async fromName (name, collectionRootFolder) {
    const section = new Section()
    section.name = name

    // Set root folder
    if (collectionRootFolder) {
      section.rootFolder = path.join(collectionRootFolder, Components.COLLECTION_SECTIONS_FOLDER, section.name)
    } else if (NodeConfig.isCollection()) {
      section.rootFolder =
        path.join(NodeUtils.getPackageRootFolder(), Components.COLLECTION_SECTIONS_FOLDER, section.name)
    } else if (NodeConfig.isSection()) {
      section.rootFolder = NodeUtils.getPackageRootFolder()
    }

    // Index Section Files
    section.files = await ComponentFilesUtils.indexFiles(section.name, section.rootFolder, new SectionFiles())

    // Load Liquid Code
    section.liquidCode = await ComponentFilesUtils.getLiquidCode(section.name, section.files)

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
      section.settingsSchema = JSON.parse(await FileUtils.getFileContents(section.files.settingsSchemaFile))
    }

    // Create Renders
    section.renders = RenderFactory.fromLiquidCode(section.liquidCode)

    // Create Snippets Recursively
    const snippetsPath = path.join(section.rootFolder, '../../', Components.COLLECTION_SNIPPETS_FOLDER)
    section.renders = await SnippetFactory.fromRenders(section.renders, section.files.snippetFiles, snippetsPath)

    return section
  }

  /**
   * Create Sections from a Collection
   * @param {string[]} sectionNames
   * @param {string} collectionRootFolder
   * @return {Promise<Section[]>}
   */
  static async fromCollection (sectionNames, collectionRootFolder) {
    const sections = []
    // Create sections
    for (const sectionName of sectionNames) {
      const section = await SectionFactory.fromName(sectionName, collectionRootFolder)
      sections.push(section)
    }
    return sections
  }
}

export default SectionFactory
