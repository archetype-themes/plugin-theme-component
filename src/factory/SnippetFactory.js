// Node.js imports
import path from 'path'

// Archie module imports
import ComponentFilesUtils from '../utils/ComponentFilesUtils.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import LocaleUtils from '../utils/LocaleUtils.js'
import logger from '../utils/Logger.js'
import RecursionError from '../errors/RecursionError.js'
import Snippet from '../main/models/Snippet.js'
import SnippetFiles from '../main/models/SnippetFiles.js'

class SnippetFactory {
  /** @type {Object<string, Snippet>} Snippet Cache to Avoid building them more than once **/
  static snippetCache = {}

  /**
   * Create Multiple Snippets From Their Names
   * @param {string[]} snippetNames  - Snippet names
   * @param {string} snippetsPath - Collection's snippets folder
   * @param {string[]} [snippetFiles] - Component's internal snippet files
   * @returns {Promise<Snippet[]>}
   */
  static async fromNames (snippetNames, snippetsPath, snippetFiles) {
    const snippets = []

    for (const snippetName of snippetNames) {
      snippets.push(this.fromName(snippetName, snippetsPath, snippetFiles))
    }

    return Promise.all(snippets)
  }

  /**
   * Create A Single Snippet From Its Name
   * @param {string} snippetName  - Snippet name
   * @param {string} snippetsPath - Collection's snippets folder
   * @param {string[]} [snippetFiles] - Component's internal snippet files
   * @returns {Promise<Snippet>}
   */
  static async fromName (snippetName, snippetsPath, snippetFiles) {
    // Start by looking into the component's internal snippet files
    if (!this.snippetCache[snippetName] && snippetFiles) {
      for (const snippetFile of snippetFiles) {
        if (snippetName === path.parse(snippetFile).name) {
          logger.debug(`Snippet "${snippetName}" was found amongst component's internal snippet files.`)
          this.snippetCache[snippetName] = await this.fromSingleFile(snippetName, snippetFile, snippetsPath)
        }
      }
    }

    // Alternatively, look into the collection snippets' workspace folder
    if (!this.snippetCache[snippetName]) {
      logger.debug(`Snippet "${snippetName}" was not found amongst component's internal snippet files. Building from folder.`)
      this.snippetCache[snippetName] = await this.fromSnippetFolder(snippetName, snippetsPath)
    }

    return this.snippetCache[snippetName]
  }

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

    const snippetNames = LiquidUtils.getSnippetNames(snippet.liquidCode)
    if (snippetNames.length) {
      logger.info(` └─> Snippet ${snippet.name} has the following snippets: ${snippetNames.join(', ')} `)
      this.validateSnippetRecursion(snippet.name, snippetNames)
      snippet.snippets = await SnippetFactory.fromNames(snippetNames, snippetsPath, snippet.files.snippetFiles)
    }

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

    const snippetNames = LiquidUtils.getSnippetNames(snippet.liquidCode)
    if (snippetNames.length) {
      logger.info(` └─> Snippet ${snippet.name} has the following snippets: ${snippetNames.join(', ')} `)
      this.validateSnippetRecursion(snippet.name, snippetNames)
      snippet.snippets = await SnippetFactory.fromNames(snippetNames, snippetsPath)
    }

    return snippet
  }

  /**
   * Validate Snippet Recursion
   * @param {string} sourceSnippetName
   * @param {string[]} childSnippetsNames
   */
  static validateSnippetRecursion (sourceSnippetName, childSnippetsNames) {
    if (childSnippetsNames.includes(sourceSnippetName)) {
      throw new RecursionError(`Snippet ${sourceSnippetName} is trying to render itself. Please verify your source code.`)
    }
  }
}

export default SnippetFactory
