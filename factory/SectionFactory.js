import Section from '../models/Section.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'
import FilesFactory from './FilesFactory.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import BuildFactory from './BuildFactory.js'

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
    section.rootFolder = await ComponentUtils.detectRootFolder(section.name)
    section.build = BuildFactory.fromSection(section)
    section.files = await FilesFactory.fromSectionFolder(section.rootFolder)

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

    return section
  }
}

export default SectionFactory
