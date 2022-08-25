import BuildFactory from './BuildFactory.js'
import FilesFactory from './FilesFactory.js'
import Section from '../models/Section.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import logger from '../utils/Logger.js'

class SectionFactory {

  /**
   * Builds a new Section and sets its basic parameters
   * @param {string} name
   * @returns {Promise<Section>}
   */
  static async fromName (name) {
    const section = new Section()
    section.name = name

    // Set Section folders
    section.rootFolder = await ComponentUtils.getValidRootFolder(section)
    section.build = BuildFactory.fromSection(section)
    section.files = await FilesFactory.fromSectionFolder(section.rootFolder)

    // Abort if no liquid file was found
    if (section.files.liquidFiles.length === 0) {
      throw new Error(`${section.name}: No liquidFiles file found - aborting build`)
    }

    // Prepare Section liquid code
    logger.debug(`${section.name}: ${section.files.liquidFiles.length} liquid file${section.files.liquidFiles.length > 1 ? 's' : ''} found`)
    section.liquidCode = await FileUtils.getMergedFilesContent(section.files.liquidFiles)

    // Prepare Section Schema
    if (section.files.schemaFile) {
      section.schema = JSON.parse(await FileUtils.getFileContents(section.files.schemaFile))
    }

    // Prepare Section Locales
    if (section.files.localeFiles && section.files.localeFiles.length > 0) {
      section.locales = await ComponentUtils.parseLocaleFilesContent(section.files.localeFiles)
    }

    // Prepare Section Renders
    section.renders = LiquidUtils.findRenders(section.liquidCode)

    return section
  }
}

export default SectionFactory
