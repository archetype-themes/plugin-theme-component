import Section from '../models/Section.js'
import { detectSectionFolder } from '../utils/SectionUtils.js'
import FileUtils from '../utils/FileUtils.js'
import ComponentUtils from '../utils/ComponentUtils.js'

class SectionFactory {
  /**
   * Builds a new Section and sets its basic parameters
   * @param {string} name
   * @returns {Promise<Section>}
   */
  static async createSection (name) {
    const section = new Section()
    section.name = name

    // Set section folders
    section.rootFolder = detectSectionFolder(section.name)
    section.buildFolder = section.rootFolder + '/build'
    section.assetsBuildFolder = section.buildFolder + '/assets'
    section.localesBuildFolder = section.buildFolder + '/locales'

    // Scan package folder & categorize files
    const sectionFiles = await FileUtils.getFolderFilesRecursively(section.rootFolder)
    ComponentUtils.filterFiles(sectionFiles, section)

    return section
  }
}

export default SectionFactory