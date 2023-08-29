// Node imports
import { mkdir, rm } from 'node:fs/promises'
import { basename, join } from 'node:path'

// External Packages
import merge from 'deepmerge'

// Archie imports
import NodeConfig from '../../cli/models/NodeConfig.js'
import BuildFactory from '../factory/BuildFactory.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import FileUtils from '../../utils/FileUtils.js'
import LocaleUtils from '../../utils/LocaleUtils.js'
import SnippetUtils from '../../utils/SnippetUtils.js'
import SectionBuilder from './SectionBuilder.js'

class CollectionBuilder {
  /**
   * Build Collection
   * @param {module:models/Collection} collection
   * @return {Promise<Awaited<unknown>[]>}
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
      await JavaScriptProcessor.buildJavaScript(jsFiles, collection.build.javascriptFile, collection.rootFolder)
    }

    // Build Locales
    collection.build.locales = this.buildLocales(collection.sections)
    collection.build.schemaLocales = this.buildLocales(collection.sections, true)

    // Build Settings Schema
    collection.build.settingsSchema = this.buildSettingsSchema(collection.sections)

    // Write Schema Locales and Settings Schema to disk for Collection Build
    // On Theme Install, these contents are merged from collection.build values.
    if (NodeConfig.isCollection()) {
      await LocaleUtils.writeLocales(collection.build.locales, collection.build.localesFolder)
      await LocaleUtils.writeLocales(collection.build.schemaLocales, collection.build.localesFolder, true)
      fileOperationPromises.push(FileUtils.writeFile(collection.build.settingsSchemaFile, JSON.stringify(collection.build.settingsSchema, null, 2)))
    }

    // Gather & Copy Sections & Snippets Liquid Files
    const processedSnippets = []
    for (const section of collection.sections) {
      fileOperationPromises.push(FileUtils.writeFile(join(collection.build.sectionsFolder, basename(section.build.liquidFile)), section.build.liquidCode))
      const {
        liquidFilesWritePromise, processedSnippets: processedSectionSnippets
      } = SnippetUtils.getLiquidFilesWritePromisesRecursively(section.snippets, collection.build.snippetsFolder, processedSnippets)
      processedSnippets.push(...processedSectionSnippets)
      fileOperationPromises.push(liquidFilesWritePromise)
    }

    // Gather & Copy Assets Files
    const assetFiles = this.getAssetFiles(collection.sections)
    fileOperationPromises.push(FileUtils.copyFilesToFolder(assetFiles, collection.build.assetsFolder))

    return Promise.all(fileOperationPromises)
  }

  /**
   * Build Collection Locales (Storefront or Schema)
   * @param {Section[]} sections
   * @param {boolean} [isSchemaLocales=false] Defaults to Storefront Locales
   * @return {Object}
   */
  static buildLocales (sections, isSchemaLocales = false) {
    let buildLocales = {}

    for (const section of sections) {
      const buildSchemaLocales = SectionBuilder.assembleLocales(section.build.schemaLocales, section.snippets, isSchemaLocales)
      buildLocales = merge(buildLocales, buildSchemaLocales)
    }

    return buildLocales
  }

  /**
   * Build Settings Schema
   * @param {Section[]} sections
   * @return {Object[]} Settings Schema
   */
  static buildSettingsSchema (sections) {
    const settingsSchema = []
    const processedSnippets = []

    for (const section of sections) {
      if (section.settingsSchema?.length) {
        settingsSchema.push(...section.settingsSchema)
      }
      if (section.snippets?.length) {
        const snippetsSettingsSchema = SnippetUtils.buildSettingsSchemaRecursively(section.snippets, processedSnippets)
        settingsSchema.push(...snippetsSettingsSchema)
      }
    }

    return settingsSchema
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
      if (section.snippets?.length) {
        assetFiles = assetFiles.concat(SnippetUtils.getAssetsRecursively(section.snippets))
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
      if (section.snippets?.length) {
        jsFiles = jsFiles.concat(SnippetUtils.getJavascriptIndexesRecursively(section.snippets))
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
      if (section.snippets?.length) {
        mainStylesheets.push(...SnippetUtils.getMainStylesheetsRecursively(section.snippets))
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
