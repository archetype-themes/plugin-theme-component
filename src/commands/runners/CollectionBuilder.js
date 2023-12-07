// Node imports
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { DEFAULT_LOCALES_REPO } from '../../config/CLI.js'

// External Packages

// Internal Imports
import BuildFactory from '../../factory/BuildFactory.js'
import Session from '../../models/static/Session.js'
import LocalesProcessor from '../../processors/LocalesProcessor.js'
import FileUtils from '../../utils/FileUtils.js'
import WebUtils from '../../utils/WebUtils.js'
import JavaScriptProcessor from '../../processors/JavaScriptProcessor.js'
import LocaleUtils from '../../utils/LocaleUtils.js'
import StylesProcessor from '../../processors/StylesProcessor.js'
import Timer from '../../utils/Timer.js'
import logger, { logChildItem } from '../../utils/Logger.js'

class CollectionBuilder {
  /**
   * Build Collection
   * @param {module:models/Collection} collection
   * @return {Promise<module:models/Collection>}
   */
  static async build (collection) {
    const allComponents = [...collection.components, ...collection.snippets]

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
      collection.importMapEntries = await JavaScriptProcessor.buildJavaScript(jsFiles, collection.build.importMapFile, collection.rootFolder)
      logChildItem(`Scripts Ready (${Timer.getEndTimerInSeconds(buildScriptsTimer)} seconds)`)
    } else {
      logger.warn('No Javascript Files Found. Javascript Build Process Was Skipped.')
    }

    // Build Locales
    const buildLocalesTimer = Timer.getTimer()
    collection.build.locales = await LocalesProcessor.build(collection.components, collection.snippets, join(collection.rootFolder, '.locales'))
    logChildItem(`Locales Ready (${Timer.getEndTimerInSeconds(buildLocalesTimer)} seconds)`)
    {
      const buildLocalesTimer = Timer.getTimer()
      let liquidCodeElements = []
      liquidCodeElements = collection.components.reduce((liquidCodeElements, component) => [...liquidCodeElements, component.liquidCode], liquidCodeElements)
      liquidCodeElements = collection.snippets.reduce((liquidCodeElements, component) => [...liquidCodeElements, component.liquidCode], liquidCodeElements)

      const localesRepoOption = Session.localesRepo ? Session.localesRepo : DEFAULT_LOCALES_REPO
      collection.build.locales = await LocalesProcessor.build(liquidCodeElements, localesRepoOption, collection.rootFolder)
      logChildItem(`Locales Ready (${Timer.getEndTimerInSeconds(buildLocalesTimer)} seconds)`)
    }

    return collection
  }

  /**
   * Deploy Collection To Folder
   * @param {module:models/Collection} collection
   * @returns {Promise<Awaited<unknown>[]>}
   */
  static async deployToBuildFolder (collection) {
    const allComponents = [...collection.components, ...collection.snippets]
    const allSnippets = [...collection.components, ...collection.snippets]

    const localesWritePromise = LocaleUtils.writeLocales(collection.build.locales, collection.build.localesFolder)

    // Write Component Liquid Files
    const snippetFilesWritePromises = allSnippets.map(component =>
      FileUtils.writeFile(join(collection.build.snippetsFolder, `${component.name}.liquid`), component.build.liquidCode))

    // Gather & Copy Assets Files
    const allAssetFiles = this.getAssetFiles(allComponents)
    const copyAssetsPromise = FileUtils.copyFilesToFolder(allAssetFiles, collection.build.assetsFolder)

    const promises = [
      FileUtils.writeFile(collection.build.stylesheet, collection.build.styles),
      localesWritePromise,
      ...snippetFilesWritePromises,
      copyAssetsPromise
    ]

    if (collection.importMapEntries?.size) {
      promises.push(this.deployImportMapFiles(collection.importMapEntries, collection.build.assetsFolder))
    }

    return Promise.all(promises)
  }

  /**
   * Deploy import map files to the assets folder
   * @param {Map<string, string>} buildEntries
   * @param {string} assetsFolder
   */
  static async deployImportMapFiles (buildEntries, assetsFolder) {
    const localFiles = []
    const remoteFiles = []
    for (const [, modulePath] of buildEntries) {
      if (WebUtils.isUrl(modulePath)) {
        remoteFiles.push(modulePath)
      } else {
        localFiles.push(modulePath)
      }
    }
    return Promise.all([FileUtils.copyFilesToFolder(localFiles, assetsFolder), WebUtils.downloadFiles(remoteFiles, assetsFolder)])
  }

  /**
   *
   * @param {(Component|Snippet)[]} components
   * @return {string[]}
   */
  static getAssetFiles (components) {
    const filteredComponents = components.filter(component => component.files.assetFiles?.length)

    return (filteredComponents.map(component => component.files.assetFiles)).flat()
  }

  /**
   * Get Collection JavaScript Files
   * @param {(Component|Snippet)[]} components
   * @return {string[]}
   */
  static getJsFiles (components) {
    const componentsWithScriptFiles = components.filter(component => component.files.javascriptIndex)
    return componentsWithScriptFiles.map(component => component.files.javascriptIndex)
  }

  /**
   * Get Main Stylesheets from all components and snippets
   * @param {(Component|Snippet)[]} components
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
