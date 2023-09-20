// Node.js Modules
import { basename, dirname, extname } from 'path'

// Internal Modules
import Components from '../config/Components.js'
import FileAccessError from '../errors/FileAccessError.js'
import FileMissingError from '../errors/FileMissingError.js'
import FileUtils from './FileUtils.js'
import JavascriptUtils from './JavascriptUtils.js'
import logger from './Logger.js'
import SectionSchema from '../models/SectionSchema.js'
import StylesUtils from './StylesUtils.js'

class ComponentFilesUtils {
  static STYLE_EXTENSIONS = ['.css', '.less', '.sass', '.scss']
  static SCRIPT_EXTENSIONS = ['.js', '.mjs', '.cjs']
  static DATA_FILE_EXTENSIONS_REGEX_CAPTURE_GROUP = '(cjs|js|json|mjs)'
  static SINGLE_LOCALE_FILENAME_REGEXP = new RegExp(`^([a-z]{2})(-[a-z]{2})?(\\.default)?\\.${this.DATA_FILE_EXTENSIONS_REGEX_CAPTURE_GROUP}$`)
  static SINGLE_SCHEMA_LOCALE_FILENAME_REGEXP = new RegExp(`^([a-z]{2})(-[a-z]{2})?(\\.default)?\\.schema\\.${this.DATA_FILE_EXTENSIONS_REGEX_CAPTURE_GROUP}$`)
  static GROUPED_LOCALES_FILENAME_REGEXP = new RegExp(`^locales?\\.${this.DATA_FILE_EXTENSIONS_REGEX_CAPTURE_GROUP}$`)
  static GROUPED_SCHEMA_LOCALES_FILENAME_REGEXP = new RegExp(`^locales?\\.schema\\.${this.DATA_FILE_EXTENSIONS_REGEX_CAPTURE_GROUP}$`)

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
      filesModel.javascriptIndex = JavascriptUtils.getMainJavascriptFile(filesModel.javascriptFiles)
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
      const extension = extname(file).toLowerCase()
      const folder = dirname(file).toLowerCase()
      const filename = basename(file).toLowerCase()

      if (folder.endsWith(`/${Components.THEME_ASSETS_FOLDER}`)) {
        componentFiles.assetFiles.push(file)
        continue
      }

      if (this.STYLE_EXTENSIONS.includes(extension)) {
        componentFiles.stylesheets.push(file)
        continue
      }

      if (this.SCRIPT_EXTENSIONS.includes(extension)) {
        if (filename === Components.SECTION_SCHEMA_FILENAME.replace('.json', extension)) {
          componentFiles.schemaFile = file
          continue
        }
        if (filename === Components.THEME_SETTINGS_SCHEMA_FILENAME.replace('.json', extension)) {
          componentFiles.settingsSchemaFile = file
          continue
        }
        if (this.SINGLE_LOCALE_FILENAME_REGEXP.exec(filename) || this.GROUPED_LOCALES_FILENAME_REGEXP.exec(filename)) {
          componentFiles.localeFiles.push(file)
          continue
        }
        if (this.SINGLE_SCHEMA_LOCALE_FILENAME_REGEXP.exec(filename) || this.GROUPED_SCHEMA_LOCALES_FILENAME_REGEXP.exec(filename)) {
          componentFiles.schemaLocaleFiles.push(file)
          continue
        }

        componentFiles.javascriptFiles.push(file)
        continue
      }

      switch (extension) {
        case '.liquid':
          if (folder.endsWith('/snippets')) {
            componentFiles.snippetFiles.push(file)
            break
          }
          componentFiles.liquidFiles.push(file)
          break
        case '.json':
          if (filename === 'package.json') {
            componentFiles.packageJson = file
            break
          }
          if (filename === Components.SECTION_SCHEMA_FILENAME) {
            componentFiles.schemaFile = file
            break
          }
          if (filename === Components.THEME_SETTINGS_SCHEMA_FILENAME) {
            componentFiles.settingsSchemaFile = file
            break
          }
          if (this.SINGLE_LOCALE_FILENAME_REGEXP.exec(filename) || this.GROUPED_LOCALES_FILENAME_REGEXP.exec(filename)) {
            componentFiles.localeFiles.push(file)
            break
          }
          if (this.SINGLE_SCHEMA_LOCALE_FILENAME_REGEXP.exec(filename) || this.GROUPED_SCHEMA_LOCALES_FILENAME_REGEXP.exec(filename)) {
            componentFiles.schemaLocaleFiles.push(file)
            break
          }
          logger.debug(`Filter Files: Unrecognised file; ignoring ${FileUtils.convertToComponentRelativePath(file)}`)
          break

        default:
          logger.debug(`Filter Files: Unrecognised file; ignoring ${FileUtils.convertToComponentRelativePath(file)}`)
          break
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
    if (this.SCRIPT_EXTENSIONS.includes(extname(schemaFile))) {
      return Object.assign(sectionSchema, (await import(schemaFile)).default)
    }
    const sectionSchemaJson = await FileUtils.getJsonFileContents(schemaFile)
    return Object.assign(sectionSchema, sectionSchemaJson)
  }

  /**
   * Get Settings Schema from schema file.
   * @param {string} schemaFile
   * @return {Promise<Object[]>}
   */
  static async getSettingsSchema (schemaFile) {
    if (this.SCRIPT_EXTENSIONS.includes(extname(schemaFile))) {
      return (await import(schemaFile)).default
    }
    return FileUtils.getJsonFileContents(schemaFile)
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
