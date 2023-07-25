// Node.js Internal imports
import merge from 'deepmerge'
import path from 'path'
import Components from '../config/Components.js'
import FileAccessError from '../errors/FileAccessError.js'
import FileMissingError from '../errors/FileMissingError.js'
import SectionSchema from '../main/models/SectionSchema.js'
import JavaScriptProcessor from '../main/processors/JavaScriptProcessor.js'

// Archie Internal JS imports
import FileUtils from './FileUtils.js'
import LocaleUtils from './LocaleUtils.js'
import logger from './Logger.js'
import StylesUtils from './StylesUtils.js'

class ComponentFilesUtils {
  /**
   * Index Component Files in a SectionFiles or SnippetFiles model
   * @param {string} componentName
   * @param {string} folder
   * @param {SectionFiles|SnippetFiles} filesModel
   * @return {Promise<SectionFiles|SnippetFiles>}
   */
  static async indexFiles (componentName, folder, filesModel) {
    // Validation: make sure the folder is readable.
    await this.validateFolderAccess(folder, componentName)

    const files = await FileUtils.getFolderFilesRecursively(folder)

    ComponentFilesUtils.filterFiles(files, filesModel)

    // Validation: Make sure that a liquid file was found
    if (filesModel.liquidFiles.length === 0) {
      throw new FileMissingError(`Section Factory: No liquid files file found for the "${componentName}" section`)
    }

    if (filesModel.javascriptFiles.length) {
      filesModel.javascriptIndex = JavaScriptProcessor.getMainJavascriptFile(filesModel.javascriptFiles)
    }

    if (filesModel.stylesheets.length) {
      filesModel.mainStylesheet = StylesUtils.getMainStyleSheet(filesModel.stylesheets)
    }

    return filesModel
  }

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

      if (folder.endsWith(`/${Components.THEME_ASSETS_FOLDER}`)) {
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
            } else if (filename === Components.SECTION_SCHEMA_FILENAME) {
              componentFiles.schemaFile = file
            } else if (filename === Components.THEME_SETTINGS_SCHEMA_FILENAME) {
              componentFiles.settingsSchemaFile = file
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

  /**
   * Validate Folder access before indexing files
   * @param {string} folder
   * @param {string} componentName
   * @return {Promise<void>}
   * @throws FileAccessError
   */
  static async validateFolderAccess (folder, componentName) {
    if (!await FileUtils.isReadable(folder)) {
      logger.debug(`Component Factory Abort: ${componentName} was not found at any expected location: "${folder}".`)
      throw new FileAccessError(`Unable to access the "${componentName}" section on disk. Tips: Is it spelled properly? Is the collection installed?`)
    }
  }
}

export default ComponentFilesUtils
