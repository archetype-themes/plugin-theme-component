import Section from '../models/Section.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'
import Build from '../models/Build.js'
import FilesFactory from './FilesFactory.js'
import ComponentUtils from '../utils/ComponentUtils.js'

class SectionFactory {
  /**
   * Builds a new Section and sets its basic parameters
   * @param {string} name
   * @returns {Promise<Section>}
   */
  static async fromName (name) {
    const section = new Section()
    section.name = name

    // Set section folders
    section.rootFolder = await ComponentUtils.detectRootFolder(section.name)
    section.build = new Build(`${section.rootFolder}/build`)
    section.files = await FilesFactory.fromSectionFolder(section.rootFolder)

    // Collate liquid content from all liquid files with the default folder/alphabetical order
    logger.debug(`${section.name}: ${section.files.liquidFiles.length} liquid file${section.files.liquidFiles.length > 1 ? 's' : ''} found`)
    section.liquidCode = await FileUtils.mergeFileContents(section.files.liquidFiles)

    return section
  }
}

export default SectionFactory
