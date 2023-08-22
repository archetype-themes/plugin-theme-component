// Node.js imports
import path from 'path'

// Archie module imports
import ComponentFilesUtils from '../../utils/ComponentFilesUtils.js'
import FileUtils from '../../utils/FileUtils.js'
import LocaleUtils from '../../utils/LocaleUtils.js'
import RenderFactory from './RenderFactory.js'
import Snippet from '../models/Snippet.js'
import SnippetFiles from '../models/SnippetFiles.js'

class SnippetFactory {
  /**
   * Build a full Snippet from its name by locating and scanning its home folder
   * @param {string} snippetName - Snippet name
   * @param {string} snippetsPath - Collection's snippets folder
   * @returns {Promise<Snippet>}
   */
  static async fromSnippetFolder (snippetName, snippetsPath) {
    const snippet = new Snippet()
    snippet.name = snippetName

    // Set root folder
    snippet.rootFolder = path.join(snippetsPath, snippet.name)

    // Index Snippet Files
    snippet.files = await ComponentFilesUtils.indexFiles(snippet.name, snippet.rootFolder, new SnippetFiles())

    // Load Liquid Code
    snippet.liquidCode = await ComponentFilesUtils.getLiquidCode(snippet.name, snippet.files)

    // Load Schema
    if (snippet.files.schemaFile) {
      snippet.schema = await ComponentFilesUtils.getSectionSchema(snippet.files.schemaFile)
    }

    // Load Locales
    if (snippet.files.localeFiles?.length) {
      snippet.locales = await LocaleUtils.parseLocaleFilesContent(snippet.files.localeFiles)
    }

    // Load Schema Locales
    if (snippet.files.schemaLocaleFiles?.length) {
      snippet.schemaLocales = await LocaleUtils.parseLocaleFilesContent(snippet.files.schemaLocaleFiles)
    }

    // Load Settings Schema
    if (snippet.files.settingsSchemaFile) {
      snippet.settingsSchema = await ComponentFilesUtils.getSettingsSchema(snippet.files.settingsSchemaFile)
    }

    // Create Renders
    snippet.renders = RenderFactory.fromLiquidCode(snippet.liquidCode, snippet.name)

    // Create Snippets Recursively
    snippet.renders = await SnippetFactory.fromRenders(snippet.renders, snippet.files.snippetFiles, snippetsPath)

    return snippet
  }

  /**
   * Builds a Snippet internal to a Section, self-contained within a single liquid file
   * @param {string} snippetName - Snippet name
   * @param {string} snippetFile - Snippet file
   * @param {string} snippetsPath - Collection's snippets folder
   * @returns {Promise<Snippet>}
   */
  static async fromSingleFile (snippetName, snippetFile, snippetsPath) {
    const snippet = new Snippet()
    snippet.name = snippetName
    snippet.files = new SnippetFiles()
    snippet.files.liquidFiles = [snippetFile]
    snippet.liquidCode = await FileUtils.getFileContents(snippetFile)

    // Non-Recursively Create Renders
    snippet.renders = RenderFactory.fromLiquidCode(snippet.liquidCode, snippet.name)
    // Create Snippets Within Renders
    snippet.renders = await SnippetFactory.fromRenders(snippet.renders, snippet.files.snippetFiles, snippetsPath)

    return snippet
  }

  /**
   *
   * @param {Render} render - Render model
   * @param {string[]} componentInternalSnippetFiles
   * @param {string} snippetsPath - Collection's snippets folder
   * @return {Promise<Snippet>}
   */
  static async fromRender (render, componentInternalSnippetFiles, snippetsPath) {
    // Look within the section's local snippets first
    for (const snippetFile of componentInternalSnippetFiles) {
      if (render.snippetName === path.parse(snippetFile).name) {
        return await this.fromSingleFile(render.snippetName, snippetFile, snippetsPath)
      }
    }

    return this.fromSnippetFolder(render.snippetName, snippetsPath)
  }

  /**
   * Create Snippets from Render items
   * @param {Render[]} renders - Render models array
   * @param {string[]} componentInternalSnippetFiles - The parent Section or Snippet's internal one-file snippet files
   * @param {string} snippetsPath - Collection's snippets folder
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
