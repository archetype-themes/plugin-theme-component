import Section from '../models/Section.js'
import { detectSectionFolder } from '../utils/SectionUtils.js'

class SectionFactory {
  /**
   * Builds a new Section and sets its basic parameters
   * @param {string} name
   * @returns {Section}
   */
  static createSection (name) {
    const section = new Section()
    section.name = name

    // Set section folders
    section.rootFolder = detectSectionFolder(section.name)
    section.buildFolder = section.rootFolder + '/build'
    section.assetsBuildFolder = section.buildFolder + '/assets'
    section.localesBuildFolder = section.buildFolder + '/locales'

    return section
  }
}

export default SectionFactory