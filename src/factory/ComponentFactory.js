import FileAccessError from '../errors/FileAccessError.js'
import FileMissingError from '../errors/FileMissingError.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'
import StylesUtils from '../utils/StylesUtils.js'
import ComponentFilesUtils from './ComponentFilesUtils.js'

class ComponentFactory {
  static async validateFolderAccess (folder, componentName) {
    if (!await FileUtils.isReadable(folder)) {
      logger.debug(`Component Factory Abort: ${componentName} was not found at any expected location: "${folder}".`)
      throw new FileAccessError(`Unable to access the "${componentName}" section on disk. Tips: Is it spelled properly? Is the collection installed?`)
    }
  }

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
}

export default ComponentFactory
