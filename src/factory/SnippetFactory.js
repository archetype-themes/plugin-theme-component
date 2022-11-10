// NodeJS imports
import path from 'path'

// Archie module imports
import BuildFactory from './BuildFactory.js'
import FilesFactory from './FilesFactory.js'
import Snippet from '../models/Snippet.js'
import SnippetFiles from '../models/SnippetFiles.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'

class SnippetFactory {
  /**
   * Build a full Snippet from its name by locating and scanning its home folder
   * @param {string} snippetName
   * @param {string} snippetsPath
   * @returns {Promise<Snippet>}
   */
  static async externalToSection (snippetName, snippetsPath) {
    const snippet = new Snippet()
    snippet.name = snippetName

    // Set Snippet folders
    snippet.rootFolder = path.join(snippetsPath, snippet.name)
    snippet.build = BuildFactory.fromSnippet(snippet)
    snippet.files = await FilesFactory.fromSnippetFolder(snippet.rootFolder)

    // Prepare Snippet liquid code
    const pluralForm = snippet.files.liquidFiles.length > 1 ? 's' : ''
    logger.debug(`${snippet.name}: ${snippet.files.liquidFiles.length} liquid file${pluralForm} found`)
    snippet.liquidCode = await FileUtils.getMergedFilesContent(snippet.files.liquidFiles)

    // Prepare Snippet Schema
    if (snippet.files.schemaFile) {
      snippet.schema = JSON.parse(await FileUtils.getFileContents(snippet.files.schemaFile))
    }

    // Prepare Snippet Locales
    if (snippet.files.localeFiles && snippet.files.localeFiles.length > 0) {
      snippet.locales = await ComponentUtils.parseLocaleFilesContent(snippet.files.localeFiles)
    }

    return snippet
  }

  /**
   * Builds a Snippet internal to a Section, self-contained within a single liquid file
   * @param {string} snippetName
   * @param {string} snippetFile
   * @returns {Promise<Snippet>}
   */
  static async internalToSection (snippetName, snippetFile) {
    const snippet = new Snippet()
    snippet.name = snippetName
    snippet.files = new SnippetFiles()
    snippet.files.liquidFiles = [snippetFile]
    snippet.liquidCode = await FileUtils.getMergedFilesContent(snippet.files.liquidFiles)

    return snippet
  }

  /**
   *
   * @param {Render} render
   * @param {string[]} sectionSnippetFiles
   * @param {string} snippetsPath
   * @return {Promise<Snippet>}
   */
  static async fromRender (render, sectionSnippetFiles, snippetsPath) {

    // Look within the section's local snippets first
    for (const snippetFile of sectionSnippetFiles) {
      if (render.snippetName === path.parse(snippetFile).name) {
        return await this.internalToSection(render.snippetName, snippetFile)
      }
    }

    return this.externalToSection(render.snippetName, snippetsPath)
  }

  /**
   * Create Snippets from Render items
   * @param {Render[]} renders
   * @param {string[]} componentInternalSnippetFiles
   * @param {string} snippetsPath
   * @return {Promise<Render[]>}
   */
  static async fromRenders (renders, componentInternalSnippetFiles, snippetsPath) {
    const snippetCache = []
    for (const render of renders) {

      // Make sure snippets are processed only once.
      if (!snippetCache[render.snippetName]) {
        snippetCache[render.snippetName] = await this.fromRender(render, componentInternalSnippetFiles, snippetsPath)
      }
      render.snippet = snippetCache[render.snippetName]
    }
    return Promise.resolve(renders)
  }

}

export default SnippetFactory
