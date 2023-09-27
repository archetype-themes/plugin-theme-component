// Node imports
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

// External Packages
import merge from 'deepmerge'

// Archie imports
import BuildFactory from '../../factory/BuildFactory.js'
import FileUtils from '../../utils/FileUtils.js'
import JavaScriptProcessor from '../../processors/JavaScriptProcessor.js'
import LocaleUtils from '../../utils/LocaleUtils.js'
import Session from '../../models/static/Session.js'
import SnippetUtils from '../../utils/SnippetUtils.js'
import StylesProcessor from '../../processors/StylesProcessor.js'
import Timer from '../../utils/Timer.js'
import { mergeObjectArraysByUniqueKey } from '../../utils/ArrayUtils.js'
import { logChildItem } from '../../utils/Logger.js'

class CollectionBuilder {
  /**
   * Build Collection
   * @param {module:models/Collection} collection
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async build (collection) {
    const allSnippets = [...collection.components, ...collection.snippets]
    const allComponents = [...collection.components, ...collection.snippets, ...collection.sections]

    const fileOperationPromises = []

    // Create build model and prepare folders
    const buildCollectionTimer = Timer.getTimer()
    collection.build = BuildFactory.fromCollection(collection)
    await this.#resetBuildFolders(collection)
    logChildItem(`Collection Build Initialized (${Timer.getEndTimerInSeconds(buildCollectionTimer)} seconds)`)

    // Gather and build Stylesheets
    const mainStylesheets = this.getMainStylesheets(allComponents)

    if (mainStylesheets.length) {
      const buildStylesTimer = Timer.getTimer()
      collection.build.styles = await StylesProcessor.buildStylesBundle(mainStylesheets, collection.build.stylesheet, collection.rootFolder)
      logChildItem(`Styles Ready (${Timer.getEndTimerInSeconds(buildStylesTimer)} seconds)`)
      fileOperationPromises.push(FileUtils.writeFile(collection.build.stylesheet, collection.build.styles))
    }
    // Gather and Build Collection JS Files
    const jsFiles = this.getJsFiles(allComponents)

    if (jsFiles.length) {
      const buildScriptsTimer = Timer.getTimer()
      await JavaScriptProcessor.buildJavaScript(jsFiles, collection.build.javascriptFile, collection.rootFolder)
      logChildItem(`Scripts Ready (${Timer.getEndTimerInSeconds(buildScriptsTimer)} seconds)`)
    }

    // Build Locales
    const buildLocalesTimer = Timer.getTimer()
    collection.build.locales = this.buildLocales(collection.sections)
    logChildItem(`Locales Ready (${Timer.getEndTimerInSeconds(buildLocalesTimer)} seconds)`)
    const buildSchemaLocalesTimer = Timer.getTimer()
    collection.build.schemaLocales = this.buildLocales(collection.sections, true)
    logChildItem(`Schema Locales Ready (${Timer.getEndTimerInSeconds(buildSchemaLocalesTimer)} seconds)`)

    // Build Settings Schema
    const buildSettingsSchemaTimer = Timer.getTimer()
    collection.build.settingsSchema = this.buildSettingsSchema(collection.sections)
    logChildItem(`Settings Schema Ready (${Timer.getEndTimerInSeconds(buildSettingsSchemaTimer)} seconds)`)

    // Write Schema Locales and Settings Schema to disk for Collection Build
    // On Theme Install, these contents are merged from collection.build values.
    if (Session.isCollection()) {
      await LocaleUtils.writeLocales(collection.build.locales, collection.build.localesFolder)
      await LocaleUtils.writeLocales(collection.build.schemaLocales, collection.build.localesFolder, true)
      fileOperationPromises.push(FileUtils.writeFile(collection.build.settingsSchemaFile, JSON.stringify(collection.build.settingsSchema, null, 2)))
    }

    // Write Component Liquid Files
    const sectionFilesWritePromises = collection.sections.map(section =>
      FileUtils.writeFile(join(collection.build.sectionsFolder, `${section.name}.liquid`), section.build.liquidCode))
    const snippetFilesWritePromises = allSnippets.map(component =>
      FileUtils.writeFile(join(collection.build.snippetsFolder, `${component.name}.liquid`), component.build.liquidCode))

    // Gather & Copy Assets Files
    const allAssetFiles = this.getAssetFiles(allComponents)
    fileOperationPromises.push(FileUtils.copyFilesToFolder(allAssetFiles, collection.build.assetsFolder))

    return Promise.all([
      ...fileOperationPromises,
      ...sectionFilesWritePromises,
      ...snippetFilesWritePromises
    ])
  }

  /**
   * Build Collection Locales (Storefront or Schema)
   * @param {Section[]} sections
   * @param {boolean} [isSchemaLocales=false] Defaults to Storefront Locales
   * @return {Object}
   */
  static buildLocales (sections, isSchemaLocales = false) {
    let buildLocales = {}
    const localesKey = isSchemaLocales ? 'schemaLocales' : 'locales'

    for (const section of sections) {
      const sectionWithSnippetsBuildLocales = SectionBuilder.assembleLocales(section.build[localesKey], section.snippets, isSchemaLocales)
      buildLocales = merge(buildLocales, sectionWithSnippetsBuildLocales)
    }

    return buildLocales
  }

  /**
   * Build Settings Schema
   * @param {Section[]} sections
   * @return {Object[]} Settings Schema
   */
  static buildSettingsSchema (sections) {
    let settingsSchema = []
    const processedSnippets = []

    for (const section of sections) {
      if (section.settingsSchema?.length) {
        settingsSchema = mergeObjectArraysByUniqueKey(settingsSchema, section.settingsSchema)
      }
      if (section.snippets?.length) {
        const snippetsSettingsSchema = SnippetUtils.buildSettingsSchemaRecursively(section.snippets, processedSnippets)
        if (snippetsSettingsSchema?.length) {
          settingsSchema = mergeObjectArraysByUniqueKey(settingsSchema, snippetsSettingsSchema)
        }
      }
    }

    return settingsSchema
  }

  /**
   *
   * @param {(Component|Section|Snippet)[]} components
   * @return {string[]}
   */
  static getAssetFiles (components) {
    const filteredComponents = components.filter(component => component.files.assetFiles?.length)

    return (filteredComponents.map(component => component.files.assetFiles)).flat()
  }

  /**
   * Get Collection JavaScript Files
   * @param {(Section|Snippet|Component)[]} components
   * @return {string[]}
   */
  static getJsFiles (components) {
    const componentsWithScriptFiles = components.filter(component => component.files.javascriptIndex)
    return componentsWithScriptFiles.map(component => component.files.javascriptIndex)
  }

  /**
   * Get Main Stylesheets from all sections and snippets
   * @param {(Component|Section|Snippet)[]} components
   * @return {string[]}
   */
  static getMainStylesheets (components) {
    const componentsWithStylesheets = components.filter(component => component.files.mainStylesheet)
    return componentsWithStylesheets.map(component => component.files.mainStylesheet)
  }

  /**
   * Reset Collection Build Folders
   * @param {module:models/Collection} collection
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async #resetBuildFolders (collection) {
    await rm(collection.build.rootFolder, { force: true, recursive: true })
    await mkdir(collection.build.rootFolder, { recursive: true })

    const buildFolders = [
      collection.build.assetsFolder,
      collection.build.configFolder,
      collection.build.localesFolder,
      collection.build.sectionsFolder,
      collection.build.snippetsFolder
    ]
    const mkdirPromises = buildFolders.map(buildFolder => mkdir(buildFolder, { recursive: true }))

    return Promise.all(mkdirPromises)
  }
}

export default CollectionBuilder
