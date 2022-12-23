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
import FileAccessError from '../errors/FileAccessError.js'
import merge from 'deepmerge'
import RenderFactory from './RenderFactory.js'
import SectionSchema from '../models/SectionSchema.js'

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

    // Validation: Make sure that the root folder is readable
    if (!await FileUtils.isReadable(snippet.rootFolder)) {
      logger.error(`Snippet Factory Abort: ${snippet.name} was not found at any expected location: "${snippet.rootFolder}".`)
      throw new FileAccessError(`Unable to access the "${snippet.name}" section on disk. Tips: Is it spelled properly? Is the collection installed?`)
    }

    // Create Snippet Files Model
    snippet.files = await FilesFactory.fromSnippetFolder(snippet.rootFolder)

    // Validation: Make sure that a liquid file was founds
    if (snippet.files.liquidFiles.length === 0) {
      throw new FileAccessError(`Snippet Factory: No liquid files file found for the "${snippet.name}" snippet`)
    }

    // Load Liquid Code
    const pluralForm = snippet.files.liquidFiles.length > 1 ? 's' : ''
    logger.debug(`${snippet.name}: ${snippet.files.liquidFiles.length} liquid file${pluralForm} found`)
    snippet.liquidCode = await FileUtils.getMergedFilesContent(snippet.files.liquidFiles)

    // Load Schema
    if (snippet.files.schemaFile) {
      snippet.schema = new SectionSchema()
      const snippetSchemaJson = JSON.parse(await FileUtils.getFileContents(snippet.files.schemaFile))
      snippet.schema = Object.assign(snippet.schema, snippetSchemaJson)
    }

    // Load Locales
    if (snippet.files.localeFiles && snippet.files.localeFiles.length > 0) {
      const locales = await ComponentUtils.parseLocaleFilesContent(snippet.files.schemaLocaleFiles)

      if (!snippet.schema) {
        snippet.schema = new SectionSchema()
      }
      if (snippet.schema.locales) {
        snippet.schema.locales = merge(snippet.schema.locales, locales)
      } else {
        snippet.schema.locales = locales
      }
    }

    // Load Schema Locales
    if (snippet.files.schemaLocaleFiles && snippet.files.schemaLocaleFiles.length > 0) {
      snippet.schemaLocales = await ComponentUtils.parseLocaleFilesContent(snippet.files.schemaLocaleFiles)
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
