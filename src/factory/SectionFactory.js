import BuildFactory from './BuildFactory.js'
import FilesFactory from './FilesFactory.js'
import Section from '../models/Section.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import logger from '../utils/Logger.js'
import merge from 'deepmerge'
import ArchieComponents from '../config/ArchieComponents.js'
import path from 'path'

class SectionFactory {

  /**
   * Builds a new Section and sets its basic parameters
   * @param {string} name
   * @param {Collection} [collection] Parent Collection
   * @returns {Promise<Section>}
   */
  static async fromName (name, collection) {
    const section = new Section()
    section.name = name

    // Set Section folders
    if (collection && collection.rootFolder) {
      section.rootFolder = path.join(collection.rootFolder, ArchieComponents.COLLECTION_SECTIONS_SUB_FOLDER, section.name)
    } else {
      section.rootFolder = await ComponentUtils.getValidRootFolder(section)
    }

    // Generate build elements
    section.build = BuildFactory.fromSection(section)
    // Find section files
    section.files = await FilesFactory.fromSectionFolder(section.rootFolder)

    // Abort if no liquid file was found
    if (section.files.liquidFiles.length === 0) {
      throw new Error(`${section.name}: No liquidFiles file found - aborting build`)
    }

    // Load liquid files' content
    logger.debug(`${section.name}: ${section.files.liquidFiles.length} liquid file${section.files.liquidFiles.length > 1 ? 's' : ''} found`)
    section.liquidCode = await FileUtils.getMergedFilesContent(section.files.liquidFiles)

    // Load Schema file content
    if (section.files.schemaFile) {
      section.schema = JSON.parse(await FileUtils.getFileContents(section.files.schemaFile))
      // Copy locales content as a separate entity
      if (section.schema.locales) {
        section.locales = section.schema.locales
      }
    }

    // Load locale files content
    if (section.files.localeFiles && section.files.localeFiles.length > 0) {
      section.locales = merge(section.locales, await ComponentUtils.parseLocaleFilesContent(section.files.localeFiles))
      section.schemaLocales = await ComponentUtils.parseLocaleFilesContent(section.files.schemaLocaleFiles)
    }

    // Parse and prepare Render models from liquid code
    section.renders = LiquidUtils.findRenders(section.liquidCode)

    return section
  }

  /**
   * Create Sections from a Collection
   * @param collection
   * @return {Promise<Section[]>}
   */
  static async fromCollection (collection) {
    const sections = []
    // Create sections
    for (const sectionName of collection.sectionNames) {
      const section = await SectionFactory.fromName(sectionName, collection)
      sections.push(section)
    }
    return sections
  }
}

export default SectionFactory
