// Node JS Internal imports
import { env } from 'node:process'
import path from 'path'
// External Node JS Modules
import merge from 'deepmerge'
// Archie Internal JS imports
import BuildFactory from './BuildFactory.js'
import FilesFactory from './FilesFactory.js'
import RenderFactory from './RenderFactory.js'
import SnippetFactory from './SnippetFactory.js'
import ArchieNodeConfig from '../cli/models/ArchieNodeConfig.js'
import FileAccessError from '../errors/FileAccessError.js'
import Collection from '../models/Collection.js'
import Section from '../models/Section.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'

class SectionFactory {

  /**
   * Builds a new Section and sets its basic parameters
   * @param {string} name
   * @param {module:models/Collection} [collection] Parent Collection
   * @returns {Promise<Section>}
   */
  static async fromName (name, collection) {
    const section = new Section()
    section.name = name

    // Set Section folders
    if (collection && collection.rootFolder) {
      section.rootFolder = path.join(collection.rootFolder, Collection.SECTIONS_SUB_FOLDER, section.name)
    } else if (ArchieNodeConfig.isCollection()) {
      section.rootFolder = path.join(path.dirname(env.npm_package_json), Collection.SECTIONS_SUB_FOLDER, section.name)
    } else if (ArchieNodeConfig.isSection()) {
      section.rootFolder = path.dirname(env.npm_package_json)
    }

    if (!await FileUtils.isReadable(section.rootFolder)) {
      logger.error(`Section Factory Abort: ${section.name} was not found at any expected location: "${section.rootFolder}".`)
      throw new FileAccessError(`Unable to access the "${section.name}" section on disk. Tips: Is it spelled properly in your archie config? Is the collection installed?`)
    }

    // Generate build elements
    section.build = BuildFactory.fromSection(section)
    // Find section files
    section.files = await FilesFactory.fromSectionFolder(section.rootFolder)

    // Abort if no liquid file was found
    if (section.files.liquidFiles.length === 0) {
      throw new FileAccessError(`Section Factory: No liquid files file found for the "${section.name}" section`)
    }

    // Load liquid code from files
    const pluralForm = section.files.liquidFiles.length > 1 ? 's' : ''
    logger.debug(`${section.name}: ${section.files.liquidFiles.length} liquid file${pluralForm} found`)
    section.liquidCode = await FileUtils.getMergedFilesContent(section.files.liquidFiles)

    // Load Schema file content
    if (section.files.schemaFile) {
      section.schema = JSON.parse(await FileUtils.getFileContents(section.files.schemaFile))
      // Copy locales content from schema file
      if (section.schema.locales) {
        section.locales = section.schema.locales
      }
    }

    // Load locale files content
    if (section.files.localeFiles && section.files.localeFiles.length > 0) {
      section.locales = merge(section.locales, await ComponentUtils.parseLocaleFilesContent(section.files.localeFiles))
      section.schemaLocales = await ComponentUtils.parseLocaleFilesContent(section.files.schemaLocaleFiles)
    }

    // Create Render Models from render tags in  Liquid Code
    const snippetsPath = path.join(section.rootFolder, '../../', Collection.SNIPPETS_SUB_FOLDER)
    section.renders = RenderFactory.fromLiquidCode(section.liquidCode)
    // Create Child Snippet Models Within Render Models
    section.renders = await SnippetFactory.fromRenders(section.renders, section.files.snippetFiles, snippetsPath)

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
