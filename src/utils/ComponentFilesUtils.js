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
import StylesUtils from './StylesUtils.js'

class ComponentFilesUtils {
  static STYLE_EXTENSIONS = ['.css', '.less', '.sass', '.scss']
  static SCRIPT_EXTENSIONS = ['.js', '.mjs', '.cjs']

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
      filesModel.javascriptIndex = JavascriptUtils.findMainJavaScriptFile(files, componentName)
    }

    if (filesModel.stylesheets.length) {
      filesModel.mainStylesheet = StylesUtils.getMainStyleSheet(filesModel.stylesheets, componentName)
    }

    return filesModel
  }

  /**
   * Filter Component Files by Type
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

          logger.debug(`Filter Files: Unrecognised file; ignoring ${FileUtils.convertToComponentRelativePath(file)}`)
          break

        default:
          logger.debug(`Filter Files: Unrecognised file; ignoring ${FileUtils.convertToComponentRelativePath(file)}`)
          break
      }
    }
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
      throw new FileAccessError(`Unable to access the "${componentName}" component on disk. Tips: Is it spelled properly? Is the collection installed?`)
    }
  }
}

export default ComponentFilesUtils
