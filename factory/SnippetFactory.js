import Build from '../models/Build.js'
import FilesFactory from './FilesFactory.js'
import Snippet from '../models/Snippet.js'
import logger from '../utils/Logger.js'
import FileUtils from '../utils/FileUtils.js'
import ComponentUtils from '../utils/ComponentUtils.js'

class SnippetFactory {
  /**
   *
   * @type {Snippet[]}
   */
  static snippetCache = []

  /**
   *
   * @param {string} snippetName
   * @returns {Promise<Snippet>}
   */
  static async fromName (snippetName) {

    if (!this.snippetCache[snippetName]) {
      const snippet = new Snippet()
      snippet.name = snippetName

      // Set snippet folders
      snippet.rootFolder = await ComponentUtils.detectRootFolder(snippet.name)
      snippet.build = new Build(snippet.rootFolder + '/build')
      snippet.files = await FilesFactory.fromSnippetFolder(snippet.rootFolder)

      // Collate liquid content from all liquid files with the default folder/alphabetical order
      logger.debug(`${snippet.name}: ${snippet.files.liquidFiles.length} liquid file${snippet.files.liquidFiles.length > 1 ? 's' : ''} found`)
      snippet.liquidCode = await FileUtils.mergeFileContents(snippet.files.liquidFiles)

      this.snippetCache[snippetName] = snippet
    }

    return this.snippetCache[snippetName]
  }
}

export default SnippetFactory
