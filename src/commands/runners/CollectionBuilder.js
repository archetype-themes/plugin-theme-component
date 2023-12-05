// Node imports
import { execSync } from 'node:child_process'
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

// External Packages

// Internal Imports
import { DEFAULT_LOCALES_REPO } from '../../config/CLI.js'
import BuildFactory from '../../factory/BuildFactory.js'
import Session from '../../models/static/Session.js'
import FileUtils from '../../utils/FileUtils.js'
import WebUtils, { isRepoUrl } from '../../utils/WebUtils.js'
import JavaScriptProcessor from '../../processors/JavaScriptProcessor.js'
import LocaleUtils from '../../utils/LocaleUtils.js'
import StylesProcessor from '../../processors/StylesProcessor.js'
import Timer from '../../utils/Timer.js'
import logger, { logChildItem, logTitleItem } from '../../utils/Logger.js'

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
    collection.build.locales = await this.buildLocales(collection.components, collection.snippets, join(collection.rootFolder, '.locales'))
    logChildItem(`Locales Ready (${Timer.getEndTimerInSeconds(buildLocalesTimer)} seconds)`)

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
   * Build Collection Storefront Locales
   * @param {Component[]} components
   * @param {Snippet[]} snippets
   * @param {string} localesFolder
   * @return {Object}
   */
  static async buildLocales (components, snippets, localesFolder) {
    const buildLocales = {}

    const translationKeys = this.getTranslationKeys(components, snippets)

    const localesRepoOption = Session.localesRepo ? Session.localesRepo : DEFAULT_LOCALES_REPO

    await this.localesSetup(localesRepoOption, localesFolder)

    const availableLocales = this.readLocales(localesFolder)

    return buildLocales
  }

  static async localesSetup (localesRepoOption, localesFolder) {
    logTitleItem('Searching For An Existing Locales Setup')
    if (await FileUtils.exists(join(localesFolder, '.git'))) {
      // 1 -> The locales folder exists, and it is a git repo
      logChildItem('Locales Setup Found: Starting Cleanup & Update')

      // Restores modified files to their original version
      execSync('git restore . --quiet', { cwd: localesFolder })
      // Cleans untracked files
      // childProcess.execSync('git clean -f -d --quiet', { cwd: devFolder })
      // Pull updates if any
      execSync('git pull --quiet', { cwd: localesFolder })

      logChildItem('Locales Setup Cleanup & Update Complete')
    } else if (!await FileUtils.exists(localesFolder)) {
      // 2 -> The locales folder doesn't exist
      if (isRepoUrl(localesRepoOption)) {
        logChildItem('No Locales Setup Found; Starting Download')
        execSync(`git clone ${localesRepoOption} ${localesFolder} --quiet`)
        logChildItem('Download Complete')
      } else {
        logChildItem('No Locales Setup Found, starting copy from local folder')
        await FileUtils.copyFolder(localesRepoOption, localesFolder, { recursive: true })
        logChildItem('Copy Finished')
      }
    } else {
      // 3 -> The locales folder exists, but it is NOT a git repo
      logChildItem('Locales Setup Found: It does not seem to be a git repository. Unable to clean or update.')
      logger.warn('Delete the ".locales" folder and restart the Dev process to fetch a new copy from source.')
    }
  }

  /**
   * Merge All Translation Keys From All Components And Snippets
   * @param {Component[]} components
   * @param {Snippet[]} snippets
   * @return {string[]}
   */static getTranslationKeys (components, snippets) {
    const translationKeys = components.reduce((translationKeys, component) => translationKeys.concat(component.translationKeys || []), [])
    translationKeys.concat(snippets.reduce((translationKeys, component) => translationKeys.concat(component.translationKeys || []), []))

    return [...new Set(translationKeys)]
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
