import FileUtils from '../utils/FileUtils.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import SectionFiles from '../models/SectionFiles.js'
import SnippetFiles from '../models/SnippetFiles.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'

class FilesFactory {
  /**
   * Generate SectionFiles object for a section, from its root folder
   * @param {string} folder
   * @returns {Promise<SectionFiles>}
   */
  static async fromSectionFolder (folder) {
    const files = await FileUtils.getFolderFilesRecursively(folder)
    const sectionFiles = new SectionFiles()
    ComponentUtils.filterFiles(files, sectionFiles)

    if (sectionFiles.javascriptFiles.length > 0) {
      sectionFiles.javascriptIndex = JavaScriptProcessor.getMainJavascriptFile(sectionFiles.javascriptFiles)
    }

    if (sectionFiles.stylesheets.length > 0) {
      sectionFiles.mainStylesheet = StylesProcessor.getMainStyleSheet(sectionFiles.stylesheets)
    }

    return sectionFiles
  }

  /**
   * Generate SnippetFiles object for a snippet, from its root folder
   * @param {string} folder
   * @returns {Promise<SnippetFiles>}
   */
  static async fromSnippetFolder (folder) {
    const files = await FileUtils.getFolderFilesRecursively(folder)
    const snippetFiles = new SnippetFiles()
    ComponentUtils.filterFiles(files, snippetFiles)

    if (snippetFiles.javascriptFiles.length > 0) {
      snippetFiles.javascriptIndex = JavaScriptProcessor.getMainJavascriptFile(snippetFiles.javascriptFiles)
    }

    if (snippetFiles.stylesheets.length > 0) {
      snippetFiles.mainStylesheet = StylesProcessor.getMainStyleSheet(snippetFiles.stylesheets)
    }

    return snippetFiles
  }
}

export default FilesFactory
