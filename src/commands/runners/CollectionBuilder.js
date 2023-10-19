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
import StylesProcessor from '../../processors/StylesProcessor.js'
import Timer from '../../utils/Timer.js'
import { logChildItem } from '../../utils/Logger.js'

class CollectionBuilder {
  /**
   * Build Collection
   * @param {module:models/Collection} collection
   * @return {Promise<module:models/Collection>}
   */
  static async build (collection) {
    const allComponents = [...collection.components, ...collection.snippets, ...collection.sections]

    // Create Collection Build model and reset folders
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
    }
    // Build Collection JS Files
    const jsFiles = this.getJsFiles(allComponents)

    if (jsFiles.length) {
      const buildScriptsTimer = Timer.getTimer()
      await JavaScriptProcessor.buildJavaScript(jsFiles, collection.build.importMapFile, collection.rootFolder, collection.build.assetsFolder)
      logChildItem(`Scripts Ready (${Timer.getEndTimerInSeconds(buildScriptsTimer)} seconds)`)
    }

    // Build Locales
    const buildLocalesTimer = Timer.getTimer()
    collection.build.locales = this.buildLocales(collection.sections)
    logChildItem(`Locales Ready (${Timer.getEndTimerInSeconds(buildLocalesTimer)} seconds)`)

    return collection
  }

  /**
   * Deploy Collection To Folder
   * @param collection
   * @returns {Promise<Awaited<unknown>[]>}
   */
  static async deployToBuildFolder (collection) {
    const allComponents = [...collection.components, ...collection.snippets, ...collection.sections]
    const allSnippets = [...collection.components, ...collection.snippets]

    const localesWritePromise = LocaleUtils.writeLocales(collection.build.locales, collection.build.localesFolder)

    // Write Component Liquid Files
    const sectionFilesWritePromises = collection.sections.map(section =>
      FileUtils.writeFile(join(collection.build.sectionsFolder, `${section.name}.liquid`), section.build.liquidCode))
    const snippetFilesWritePromises = allSnippets.map(component =>
      FileUtils.writeFile(join(collection.build.snippetsFolder, `${component.name}.liquid`), component.build.liquidCode))

    // Gather & Copy Assets Files
    const allAssetFiles = this.getAssetFiles(allComponents)
    const copyAssetsPromise = FileUtils.copyFilesToFolder(allAssetFiles, collection.build.assetsFolder)

    return Promise.all([
      FileUtils.writeFile(collection.build.stylesheet, collection.build.styles),
      localesWritePromise,
      ...sectionFilesWritePromises,
      ...snippetFilesWritePromises,
      copyAssetsPromise
    ])
  }

  /**
   * Build Collection Storefront Locales
   * @param {(Section|Snippet|Component)[]} components
   * @return {Object}
   */
  static buildLocales (components) {
    let buildLocales = {}

    for (const component of components) {
      buildLocales = merge(buildLocales, component.build.locales)
    }

    return buildLocales
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
