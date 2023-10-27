// Node.js Modules
import { basename, dirname, extname } from 'path'

// Internal Modules
import Components from '../config/Components.js'
import FileAccessError from '../errors/FileAccessError.js'
import FileMissingError from '../errors/FileMissingError.js'
import FileUtils from './FileUtils.js'
import InputFileError from '../errors/InputFileError.js'
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
   * Index Component Files
   * @param {string} componentName
   * @param {string} folder
   * @param {ComponentFiles} filesModel
   * @return {Promise<ComponentFiles>}
   */
  static async indexFiles (componentName, folder, filesModel) {
    // Validation: make sure the folder is readable.
    await this.validateFolderAccess(folder, componentName)

    const files = await FileUtils.getFolderFilesRecursively(folder)

    ComponentFilesUtils.filterFiles(files, filesModel, componentName)

    // Validation: Make sure that a liquid file was found
    if (!filesModel.liquidFile) {
      throw new FileMissingError(`No liquid files file found for the "${componentName}" component`)
    }

    if (files) {
      filesModel.javascriptIndex = JavascriptUtils.getMainJavascriptFile(files, componentName)
    }

    if (filesModel.stylesheets.length) {
      filesModel.mainStylesheet = StylesUtils.getMainStyleSheet(filesModel.stylesheets)
    }

    return filesModel
  }

  /**
   * Filter Section/Snippet Files by Type
   * @param {string[]} files
   * @param {ComponentFiles} componentFiles
   * @param {string} componentName
   */
  static filterFiles (files, componentFiles, componentName) {
    // Categorize files for the build steps
    for (const file of files) {
      const extension = extname(file).toLowerCase()
      const folder = dirname(file).toLowerCase()
      const filename = basename(file).toLowerCase()

      if (folder.endsWith(`/${Components.ASSETS_FOLDER_NAME}`)) {
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
          if (filename.split('.')[0] === componentName || filename === 'index.liquid') {
            if (componentFiles.liquidFile) {
              throw new InputFileError(`Two main liquid files found for the same component ${componentFiles.liquidFile} and ${file}`)
            }
            componentFiles.liquidFile = file
            break
          }
          if (folder.endsWith('/snippets')) {
            componentFiles.snippetFiles.push(file)
            break
          }
          logger.warn(`Ignored liquid file ${filename}`)
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
