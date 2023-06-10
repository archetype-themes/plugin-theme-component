// Node JS Internal imports
import path from 'path'

// External Node JS Modules
import SectionFiles from '../models/SectionFiles.js'
import ComponentFilesUtils from '../utils/ComponentFilesUtils.js'

// Archie Internal JS imports
import RenderFactory from './RenderFactory.js'
import SnippetFactory from './SnippetFactory.js'
import NodeConfig from '../cli/models/NodeConfig.js'
import Section from '../models/Section.js'
import SectionSchema from '../models/SectionSchema.js'
import Components from '../config/Components.js'
import NodeUtils from '../utils/NodeUtils.js'

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

    // Load Locales into schema data
    if (section.files.localeFiles?.length) {
      // If a schema file was not present, we need to create the section schema to store locale content
      if (!section.schema) {
        section.schema = new SectionSchema()
      }
      section.schema.locales = await ComponentFilesUtils.getLocales(section.files.localeFiles, section.schema.locales)
    }

    // Load Schema Locales
    if (section.files.schemaLocaleFiles?.length) {
      section.schemaLocales = ComponentFilesUtils.getSchemaLocales(section.files.schemaLocaleFiles)
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
