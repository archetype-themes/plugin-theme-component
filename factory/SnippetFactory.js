import FilesFactory from './FilesFactory.js'
import Snippet from '../models/Snippet.js'
import logger from '../utils/Logger.js'
import FileUtils from '../utils/FileUtils.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import BuildFactory from './BuildFactory.js'

class SnippetFactory {
  /**
   * Build a full Snippet from its name by locating and scanning its home folder
   * @param {string} snippetName
   * @returns {Promise<Snippet>}
   */
  static async fromName (snippetName) {
    const snippet = new Snippet()
    snippet.name = snippetName

    // Set snippet folders
    snippet.rootFolder = await ComponentUtils.detectRootFolder(snippet.name)
    snippet.build = BuildFactory.fromSnippet(snippet)
    snippet.files = await FilesFactory.fromSnippetFolder(snippet.rootFolder)

    // Collate liquid content from all liquid files with the default folder/alphabetical order
    logger.debug(`${snippet.name}: ${snippet.files.liquidFiles.length} liquid file${snippet.files.liquidFiles.length > 1 ? 's' : ''} found`)
    snippet.liquidCode = await FileUtils.getMergedFilesContent(snippet.files.liquidFiles)

    if (snippet.files.javascriptFiles) {
      //snippet.javascript = JavaScriptProcessor.buildJavaScript()
    }

    return snippet
  }

  /**
   * Builds a Snippet internal to a Section, self-contained within a single liquid file
   * @param {string} snippetName
   * @param {string} snippetFile
   * @returns {Promise<Snippet>}
   */
  static async fromSingleFile (snippetName, snippetFile) {
    const snippet = new Snippet()
    snippet.name = snippetName
    snippet.files.liquidFiles = [snippetFile]
    snippet.liquidCode = await FileUtils.getMergedFilesContent(snippet.files.liquidFiles)

    return snippet
  }

}

export default SnippetFactory
