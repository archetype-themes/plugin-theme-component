// Node JS Internal imports
import { env } from 'node:process'
import path from 'path'

// External Node JS Modules
import deepmerge from 'deepmerge'

// Archie Internal JS imports
import FilesFactory from './FilesFactory.js'
import RenderFactory from './RenderFactory.js'
import SnippetFactory from './SnippetFactory.js'
import ArchieConfig from '../cli/models/ArchieConfig.js'
import FileAccessError from '../errors/FileAccessError.js'
import Collection from '../models/Collection.js'
import Section from '../models/Section.js'
import SectionSchema from '../models/SectionSchema.js'
import FileUtils from '../utils/FileUtils.js'
import LocaleUtils from '../utils/LocaleUtils.js'
import logger from '../utils/Logger.js'

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
      section.rootFolder = path.join(collectionRootFolder, Collection.SECTIONS_SUB_FOLDER, section.name)
    } else if (ArchieConfig.isCollection()) {
      section.rootFolder = path.join(path.dirname(env.npm_package_json), Collection.SECTIONS_SUB_FOLDER, section.name)
    } else if (ArchieConfig.isSection()) {
      section.rootFolder = path.dirname(env.npm_package_json)
    }

    // Validation: Make sure that the root folder is readable
    if (!await FileUtils.isReadable(section.rootFolder)) {
      logger.error(`Section Factory Abort: ${section.name} was not found at any expected location: "${section.rootFolder}".`)
      throw new FileAccessError(`Unable to access the "${section.name}" section on disk. Tips: Is it spelled properly in your archie config? Is the collection installed?`)
    }

    // Create Section Files model
    section.files = await FilesFactory.fromSectionFolder(section.rootFolder)

    // Validation: Make sure that a liquid file was found
    if (section.files.liquidFiles.length === 0) {
      throw new FileAccessError(`Section Factory: No liquid files file found for the "${section.name}" section`)
    }

    // Load Liquid Code
    const pluralForm = section.files.liquidFiles.length > 1 ? 's' : ''
    logger.debug(`${section.name}: ${section.files.liquidFiles.length} liquid file${pluralForm} found`)
    section.liquidCode = await FileUtils.getMergedFilesContent(section.files.liquidFiles)

    // Load Schema
    if (section.files.schemaFile) {
      section.schema = new SectionSchema()
      const sectionSchemaJson = JSON.parse(await FileUtils.getFileContents(section.files.schemaFile))
      section.schema = Object.assign(section.schema, sectionSchemaJson)
    }

    // Load Locales
    if (section.files.localeFiles && section.files.localeFiles.length > 0) {
      const locales = await LocaleUtils.parseLocaleFilesContent(section.files.localeFiles)
      if (!section.schema) {
        section.schema = new SectionSchema()
      }
      if (section.schema.locales) {
        section.schema.locales = deepmerge(section.schema.locales, locales)
      } else {
        section.schema.locales = locales
      }
    }

    // Load Schema Locales
    if (section.files.schemaLocaleFiles && section.files.schemaLocaleFiles.length > 0) {
      section.schemaLocales = await LocaleUtils.parseLocaleFilesContent(section.files.schemaLocaleFiles)
    }

    // Create Renders
    section.renders = RenderFactory.fromLiquidCode(section.liquidCode)

    // Create Snippets Recursively
    const snippetsPath = path.join(section.rootFolder, '../../', Collection.SNIPPETS_SUB_FOLDER)
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
