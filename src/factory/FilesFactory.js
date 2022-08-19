import FileUtils from '../utils/FileUtils.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import SectionFiles from '../models/SectionFiles.js'
import SnippetFiles from '../models/SnippetFiles.js'

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

    return snippetFiles
  }
}

export default FilesFactory
