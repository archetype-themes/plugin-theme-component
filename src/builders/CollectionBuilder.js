// Node imports
import merge from 'deepmerge'
import { mkdir, rm } from 'node:fs/promises'
import { basename, join } from 'node:path'

// Archie imports
import SectionBuilder from './SectionBuilder.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'
import RecursiveRenderUtils from '../utils/RecursiveRenderUtils.js'
import BuildFactory from '../factory/BuildFactory.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import LocaleUtils from '../utils/LocaleUtils.js'

class CollectionBuilder {
  /**
   * Build Collection
   * @param {module:models/Collection} collection
   * @return {Promise<void>}
   */
  static async build (collection) {
    const fileOperationPromises = []

    // Create build model and prepare folders
    collection.build = BuildFactory.fromCollection(collection)
    await this.#resetBuildFolders(collection)

    // Start Timer
    const startTime = process.hrtime()
    logger.info(`Starting Sections' build for: ${collection.sectionNames.join(', ')}`)

    // Build sections (will also build inner snippets recursively)
    await SectionBuilder.buildMany(collection.sections, collection.rootFolder)

    logger.info(`Finished Sections' build in ${process.hrtime(startTime).toString().slice(0, 5)} seconds`)

    // Gather and build Stylesheets
    const mainStylesheets = this.getMainStylesheets(collection)
    collection.build.styles = await StylesProcessor.buildStylesBundle(mainStylesheets, collection.build.stylesheet, collection.rootFolder)
    fileOperationPromises.push(FileUtils.writeFile(collection.build.stylesheet, collection.build.styles))

    // Gather and Build Collection JS Files
    const jsFiles = this.getJsFiles(collection)
    if (jsFiles.length > 0) {
      await JavaScriptProcessor.buildJavaScript(collection.rootFolder, collection.build.javascriptFile, jsFiles.shift(), jsFiles)
    }

    // Build and Write Schema Locales
    collection.build.schemaLocales = this.buildSchemaLocales(collection.sections)
    await LocaleUtils.writeSchemaLocales(collection.build.schemaLocales, collection.build.localesFolder)

    // Gather & Copy Sections & Snippets Liquid Files
    const processedSnippets = []
    for (const section of collection.sections) {
      fileOperationPromises.push(FileUtils.writeFile(join(collection.build.sectionsFolder, basename(section.build.liquidFile)), section.build.liquidCode))
      const {
        liquidFilesWritePromise,
        processedSnippets: processedSectionSnippets
      } = RecursiveRenderUtils.getSnippetsLiquidFilesWritePromise(section.renders, collection.build.snippetsFolder, processedSnippets)
      processedSnippets.push(...processedSectionSnippets)
      fileOperationPromises.push(liquidFilesWritePromise)
    }

    // Copy External Snippet Files
    fileOperationPromises.push(this.copySnippetLiquidFiles(collection.sections, collection.build.snippetsFolder))

    // Gather & Copy Assets Files
    const assetFiles = this.getAssetFiles(collection.sections)
    fileOperationPromises.push(FileUtils.copyFilesToFolder(assetFiles, collection.build.assetsFolder))

    return Promise.all(fileOperationPromises)
  }

  /**
   * Build Collection Schema Locales
   * @param {Section[]} sections
   * @return {Object}
   */
  static buildSchemaLocales (sections) {
    let schemaLocales = {}

    for (const section of sections) {
      if (section.build.schemaLocales) {
        schemaLocales = merge(schemaLocales, section.build.schemaLocales)
      }
    }

    return schemaLocales
  }

  /**
   * Copy Snippet Liquid Files
   * @param {Section[]} sections
   * @param {string} snippetsFolder
   * @return {Promise<Awaited<void>[]>}
   */
  static async copySnippetLiquidFiles (sections, snippetsFolder) {
    const folderCopyPromises = []
    for (const section of sections) {
      if (section.renders) {
        if (await FileUtils.isReadable(section.build.snippetsFolder)) {
          folderCopyPromises.push(FileUtils.copyFolder(section.build.snippetsFolder, snippetsFolder))
        }
      }
    }
    return Promise.all(folderCopyPromises)
  }

  /**
   *
   * @param {Section[]} sections
   * @return {string[]}
   */
  static getAssetFiles (sections) {
    let assetFiles = []

    for (const section of sections) {
      if (section.files.assetFiles) {
        assetFiles = assetFiles.concat(section.files.assetFiles)
      }
      if (section.renders) {
        assetFiles = assetFiles.concat(RecursiveRenderUtils.getSnippetAssets(section.renders))
      }
    }

    // Remove dupes
    assetFiles = [...new Set(assetFiles)]

    return assetFiles
  }

  /**
   * Get Collection JavaScript Files
   * @param collection
   * @return {string[]}
   */
  static getJsFiles (collection) {
    let jsFiles = []

    for (const section of collection.sections) {
      // Add Section file
      if (section.files.javascriptIndex) {
        jsFiles.push(section.files.javascriptIndex)
      }

      // Add Section snippet files
      if (section.renders) {
        jsFiles = jsFiles.concat(RecursiveRenderUtils.getSnippetsJavascriptIndex(section.renders))
      }
    }

    // Remove dupes
    jsFiles = [...new Set(jsFiles)]

    return jsFiles
  }

  /**
   * Get Main Stylesheets from all sections and snippets
   * @param {module:models/Collection} collection
   * @return {string[]}
   */
  static getMainStylesheets (collection) {
    let mainStylesheets = []

    for (const section of collection.sections) {
      if (section.files.mainStylesheet) {
        mainStylesheets.push(section.files.mainStylesheet)
      }
      if (section.renders) {
        mainStylesheets.push(...RecursiveRenderUtils.getSnippetsMainStylesheet(section.renders))
      }
    }

    // Remove dupes
    mainStylesheets = [...new Set(mainStylesheets)]

    return mainStylesheets
  }

  /**
   * Reset Collection Build Folders
   * @param {module:models/Collection} collection
   * @return {Promise<void>}
   */
  static async #resetBuildFolders (collection) {
    await rm(collection.build.rootFolder, { force: true, recursive: true })

    await mkdir(collection.build.rootFolder, { recursive: true })
    await mkdir(collection.build.assetsFolder, { recursive: true })
    await mkdir(collection.build.localesFolder, { recursive: true })
    await mkdir(collection.build.sectionsFolder, { recursive: true })
    await mkdir(collection.build.snippetsFolder, { recursive: true })
  }
}

export default CollectionBuilder
