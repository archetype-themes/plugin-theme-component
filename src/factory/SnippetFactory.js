// Node.js imports
import { basename, dirname, join, parse } from 'node:path'

// Archie module imports
import ComponentFilesUtils from '../utils/ComponentFilesUtils.js'
import FileMissingError from '../errors/FileMissingError.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import LocaleUtils from '../utils/LocaleUtils.js'
import logger from '../utils/Logger.js'
import RecursionError from '../errors/RecursionError.js'
import Snippet from '../models/Snippet.js'
import SnippetFiles from '../models/SnippetFiles.js'

class SnippetFactory {
  /** @type {Object<string, Snippet>} Snippet Cache to Avoid building them more than once **/
  static snippetCache = {}

  /**
   * Create All Snippets For A Collection
   * @param {Section[]} sections
   * @param {Snippet[]} [collectionSnippets]
   * @returns {Promise<Section[]>}
   */
  static async fromSections (sections, collectionSnippets) {
    for (const section of sections) {
      if (section.snippetNames.length) {
        logger.info(`└─> Section ${section.name} has the following snippets: ${section.snippetNames.join(', ')} `)
        section.snippets = await this.fromComponent(section, section.files.snippetFiles, collectionSnippets)
      }
    }

    return sections
  }

  /**
   * Create All Snippets For A Component
   * @param {Section|Snippet} component
   * @param {string[]} snippetFiles
   * @param {Snippet[]} [collectionSnippets]
   * @returns {Promise<Snippet[]>}
   */
  static async fromComponent (component, snippetFiles, collectionSnippets) {
    const componentSnippets = []
    const snippetFileNames = []

    if (snippetFiles?.length) {
      for (const snippetFile of snippetFiles) {
        snippetFileNames.push(basename(snippetFile).split('.')[0])
      }
    }

    for (const snippetName of component.snippetNames) {
      // Check in the cache first
      if (this.snippetCache[snippetName]) {
        componentSnippets.push(this.snippetCache[snippetName])
        continue
      }

      // Check Provided additional snippet files
      if (snippetFileNames.includes(snippetName)) {
        logger.debug(`Snippet "${snippetName}" was found amongst the component's internal snippet files.`)
        const snippetFile = snippetFiles.find(snippetFile => basename(snippetFile).split('.')[0] === snippetName)
        componentSnippets.push(await this.fromSingleFile2(snippetName, snippetFile, snippetFiles, collectionSnippets))
      }

      // Check in the Collection's snippets
      let snippet = collectionSnippets.find(snippet => snippet.name === snippetName)
      if (snippet === undefined) {
        throw new FileMissingError(`Unable to find the ${snippetName} snippet anywhere. Please check spelling.`)
      }
      snippet = await this.initializeSnippet(snippet)
      // Recursively initialize snippets from render tags
      snippet = await this.checkForChilds(snippet, snippetFiles, collectionSnippets)
      componentSnippets.push(snippet)
    }
    return componentSnippets
  }

  /**
   * Initialize All Other Properties Of A Base Snippet
   * => A Base Snippet Only Has A Name And A Root Folder
   * @param {Snippet} snippet
   * @returns {Promise<Snippet>}
   */
  static async initializeSnippet (snippet) {
    // Index Snippet Files
    snippet.files = await ComponentFilesUtils.indexFiles(snippet.name, snippet.rootFolder, new SnippetFiles())

    // Load Liquid Code
    snippet.liquidCode = await FileUtils.getFileContents(snippet.files.liquidFile)

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

    // Find snippet names in render tags
    snippet.snippetNames = LiquidUtils.getSnippetNames(snippet.liquidCode)

    return snippet
  }

  /**
   * Builds a Snippet internal to a Section, self-contained within a single liquid file
   * @param {string} snippetName - Snippet name
   * @param {string} snippetFile - Snippet file
   * @param {string[]} peerSnippetFiles - Additional Snippet files from the same folder
   * @param {Snippet[]} [collectionSnippets]
   * @returns {Promise<Snippet>}
   */
  static async fromSingleFile2 (snippetName, snippetFile, peerSnippetFiles, collectionSnippets) {
    let snippet = new Snippet()
    snippet.name = snippetName
    snippet.rootFolder = dirname(snippetFile)
    snippet.files = new SnippetFiles()
    snippet.files.liquidFile = snippetFile
    snippet.liquidCode = await FileUtils.getFileContents(snippetFile)
    snippet.snippetNames = LiquidUtils.getSnippetNames(snippet.liquidCode)

    snippet = await this.checkForChilds(snippet, peerSnippetFiles, collectionSnippets)

    return snippet
  }

  /**
   * Recursively initialize snippets from render tags
   * @param {Section|Snippet} component
   * @param {string[]} componentSnippetFiles
   * @param {Snippet[]} [collectionSnippets]
   * @returns {Promise<Section|Snippet>}
   */
  static async checkForChilds (component, componentSnippetFiles, collectionSnippets) {
    if (component.snippetNames.length) {
      this.validateSnippetRecursion(component.name, component.snippetNames)
      component.snippets = await SnippetFactory.fromComponent(component, componentSnippetFiles, collectionSnippets)
    }
    return component
  }

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
        if (snippetName === parse(snippetFile).name) {
          logger.debug(`Snippet "${snippetName}" was found amongst component's internal snippet files.`)
          return this.fromSingleFile(snippetName, snippetFile, snippetsPath)
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
   * @param {Snippet[]} [componentSnippets] - Root Component's available snippets
   * @returns {Promise<Snippet>}
   */
  static async fromSnippetFolder (snippetName, snippetsPath, componentSnippets) {
    let snippet = new Snippet()
    // Set Name
    snippet.name = snippetName

    // Set Root Folder
    snippet.rootFolder = join(snippetsPath, snippet.name)

    // Process the rest of properties here
    snippet = await this.initializeSnippet(snippet)
    // Recursively initialize snippets from render tags
    snippet = await this.checkForChilds(snippet, snippet.files.snippetFiles, componentSnippets)

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
    snippet.files.liquidFile = snippetFile
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
