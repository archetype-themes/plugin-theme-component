// Node JS Internal imports
import merge from 'deepmerge'
import path from 'path'
import SectionSchema from '../models/SectionSchema.js'

// Archie Internal JS imports
import FileUtils from '../utils/FileUtils.js'
import LocaleUtils from '../utils/LocaleUtils.js'
import logger from '../utils/Logger.js'

class ComponentFilesUtils {
  /**
   * Filter Section/Snippet Files by Type
   * @param {string[]} files
   * @param {SectionFiles|SnippetFiles} componentFiles
   */
  static filterFiles (files, componentFiles) {
    // Categorize files for the build steps
    for (const file of files) {
      const extension = path.extname(file).toLowerCase()
      const folder = path.dirname(file).toLowerCase()

      if (folder.endsWith('/assets')) {
        componentFiles.assetFiles.push(file)
      } else {
        const filename = path.basename(file).toLowerCase()

        switch (extension) {
          case '.css':
          case '.less':
          case '.sass':
          case '.scss':
            componentFiles.stylesheets.push(file)
            break
          case '.js':
          case '.mjs':
            componentFiles.javascriptFiles.push(file)
            break
          case '.liquid':
            if (folder.endsWith('/snippets')) {
              componentFiles.snippetFiles.push(file)
            } else {
              componentFiles.liquidFiles.push(file)
            }
            break
          case '.json':
            if (filename === 'package.json') {
              componentFiles.packageJson = file
            } else if (filename === 'schema.json') {
              componentFiles.schemaFile = file
            } else if (filename.match(/^([a-z]{2})(-[a-z]{2})?(\.default)?\.json$/) ||
              filename.match(/^locales?\.json$/)) {
              componentFiles.localeFiles.push(file)
            } else if (filename.match(/^([a-z]{2})(-[a-z]{2})?(\.default)?\.schema\.json$/) ||
              filename.match(/^locales?\.schema\.json$/)) {
              componentFiles.schemaLocaleFiles.push(file)
            }

            break
          default:
            logger.debug(`Filter Files: Unrecognised file; ignoring ${FileUtils.convertToComponentRelativePath(file)}`)
            break
        }
      }
    }
  }

  /**
   * Get Liquid Code From Component Liquid Files
   * @param {string} componentName
   * @param {SectionFiles|SnippetFiles} componentFiles
   * @return {Promise<string>}
   */
  static async getLiquidCode (componentName, componentFiles) {
    const pluralForm = componentFiles.liquidFiles.length > 1 ? 's' : ''
    logger.debug(`${componentName}: ${componentFiles.liquidFiles.length} liquid file${pluralForm} found`)
    return FileUtils.getMergedFilesContent(componentFiles.liquidFiles)
  }

  /**
   * Get Section Schema from schema file.
   * @param {string} schemaFile
   * @return {Promise<SectionSchema>}
   */
  static async getSectionSchema (schemaFile) {
    const sectionSchema = new SectionSchema()
    const sectionSchemaJson = JSON.parse(await FileUtils.getFileContents(schemaFile))
    return Object.assign(sectionSchema, sectionSchemaJson)
  }

  /**
   * Get Locales from Locale Files
   * @param {string[]} localeFiles - locale files from SectionFiles or SnippetFiles
   * @param {Object} [preexistingLocales] - locale data tha was already present in the schema file
   * @return {Promise<Object>}
   */
  static async getLocales (localeFiles, preexistingLocales) {
    const locales = await LocaleUtils.parseLocaleFilesContent(localeFiles)
    // If some locale data was already present in the schema file, we need to merge contents.
    return preexistingLocales ? merge(preexistingLocales, locales) : locales
  }

  /**
   * Get Schema Locales from schema locale files
   * @param schemaLocaleFiles
   * @return {Promise<{}>}
   */
  static async getSchemaLocales (schemaLocaleFiles) {
    return LocaleUtils.parseLocaleFilesContent(schemaLocaleFiles)
  }
}

export default ComponentFilesUtils
