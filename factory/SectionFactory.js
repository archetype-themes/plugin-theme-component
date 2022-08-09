import { readFile } from 'node:fs/promises'

import Section from '../models/Section.js'

import ComponentUtils from '../utils/ComponentUtils.js'
import FileUtils, { FILE_ENCODING_OPTION } from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import logger from '../utils/Logger.js'
import { detectSectionFolder } from '../utils/SectionUtils.js'

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

    // Collate liquid content from all liquid files with the default folder/alphabetical order
    logger.debug(`${section.liquidFiles.length} liquid file${section.liquidFiles.length > 1 ? 's' : ''} found`)
    for (const liquidFile of section.liquidFiles) {
      section.liquidCode += `\n${await readFile(liquidFile, FILE_ENCODING_OPTION)}`
    }

    section.renders = LiquidUtils.findRenders(section.liquidCode)
    logger.debug(`${section.renders.length} render tag${section.renders.length > 1 ? 's' : ''} found`)

    return section
  }
}

export default SectionFactory