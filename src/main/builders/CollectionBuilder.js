// Node imports
import { mkdir, rm } from 'node:fs/promises'
import { basename, join } from 'node:path'

// External Packages
import merge from 'deepmerge'

// Archie imports
import BuildFactory from '../factory/BuildFactory.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import FileUtils from '../../utils/FileUtils.js'
import LocaleUtils from '../../utils/LocaleUtils.js'
import RecursiveRenderUtils from '../../utils/RecursiveRenderUtils.js'

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

    // Gather and build Stylesheets
    const mainStylesheets = this.getMainStylesheets(collection)
    collection.build.styles = await StylesProcessor.buildStylesBundle(mainStylesheets, collection.build.stylesheet, collection.rootFolder)
    fileOperationPromises.push(FileUtils.writeFile(collection.build.stylesheet, collection.build.styles))

    // Gather and Build Collection JS Files
    const jsFiles = this.getJsFiles(collection)
    if (jsFiles.length) {
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
      if (section.renders?.length) {
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
      if (section.renders?.length) {
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
      if (section.renders?.length) {
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
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async #resetBuildFolders (collection) {
    await rm(collection.build.rootFolder, { force: true, recursive: true })

    await mkdir(collection.build.rootFolder, { recursive: true })

    const mkdirPromises = []

    mkdirPromises.push(mkdir(collection.build.assetsFolder, { recursive: true }))
    mkdirPromises.push(mkdir(collection.build.configFolder, { recursive: true }))
    mkdirPromises.push(mkdir(collection.build.localesFolder, { recursive: true }))
    mkdirPromises.push(mkdir(collection.build.sectionsFolder, { recursive: true }))
    mkdirPromises.push(mkdir(collection.build.snippetsFolder, { recursive: true }))

    return Promise.all(mkdirPromises)
  }
}

export default CollectionBuilder
