// Node imports
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

// Internal Imports
import BuildFactory from '../../factory/BuildFactory.js'
import Session from '../../models/static/Session.js'
import LocalesProcessor from '../../processors/LocalesProcessor.js'
import FileUtils from '../../utils/FileUtils.js'
import WebUtils from '../../utils/WebUtils.js'
import JavaScriptProcessor from '../../processors/JavaScriptProcessor.js'
import LocaleUtils from '../../utils/LocaleUtils.js'
import StylesProcessor from '../../processors/StylesProcessor.js'
import { getTimeElapsed, getTimer } from '../../utils/Timer.js'
import { logChildItem, WARN_LOG_LEVEL } from '../../utils/Logger.js'
import { DEFAULT_LOCALES_REPO } from '../../config/CLI.js'

class CollectionBuilder {
  /**
   * Build Collection
   * @param {module:models/Collection} collection
   * @return {Promise<module:models/Collection>}
   */
  static async build (collection) {
    const allComponents = collection.allComponents

    const buildCollectionTimer = getTimer()
    collection.build = BuildFactory.fromCollection(collection)
    await this.#resetBuildFolders(collection.build)
    logChildItem(`Collection Build Initialized (${getTimeElapsed(buildCollectionTimer)} seconds)`);

    [collection.importMapEntries, collection.build.locales, collection.build.styles] = await Promise.all([
      this.#buildJavaScript(allComponents, collection.build.importMapFile, collection.rootFolder),
      this.#buildLocales(allComponents, collection.rootFolder),
      this.#buildStyles(allComponents, collection.build.stylesheet, collection.rootFolder)
    ])

    return collection
  }

  /**
   * Builds JavaScript files for the given collection and components.
   *
   * @param {(Component|Snippet)[]} components - An array of all components.
   * @param {string} importMapFile - The collection's import map file.
   * @param {string} cwd - The working directory.
   * @return {Map<string, string>} - A promise that resolves when the JavaScript files have been built.
   */
  static async #buildJavaScript (components, importMapFile, cwd) {
    const jsFiles = this.#getJsFiles(components)

    if (jsFiles.length) {
      return JavaScriptProcessor.buildJavaScript(jsFiles, importMapFile, cwd)
    } else {
      logChildItem('No Javascript Files Found. Javascript Build Process Was Skipped.', WARN_LOG_LEVEL)
    }
  }

  /**
   * Builds locales for the given collection and all components.
   *
   * @param {(Component|Snippet)[]} components - All components to extract liquid code from.
   * @param {string} cwd - The working directory.
   * @return {Promise<{}>} - A promise that resolves when the locales are built.
   */
  static async #buildLocales (components, cwd) {
    const localesRepoOption = Session.localesRepo || DEFAULT_LOCALES_REPO

    const liquidCodeElements = components.map(component => component.liquidCode)
    return LocalesProcessor.build(liquidCodeElements, localesRepoOption, cwd)
  }

  /**
   * Builds the styles for the given collection and all components.
   *
   * @param {(Component|Snippet)[]} components - An array containing all the components.
   * @param {string} outputFile - The collection's css bundle file.
   * @param {string} cwd - The working directory.
   * @return {Promise<string>} - A promise that resolves when the styles are built.
   */
  static async #buildStyles (components, outputFile, cwd) {
    const mainStylesheets = this.#getMainStylesheets(components)

    if (mainStylesheets.length) {
      return StylesProcessor.buildStylesBundle(mainStylesheets, outputFile, cwd)
    }
  }

  /**
   * Deploy Collection To Folder
   * @param {module:models/Collection} collection
   * @returns {Promise<Awaited<unknown>[]>}
   */
  static async deployToBuildFolder (collection) {
    const allComponents = collection.allComponents

    const localesWritePromise = LocaleUtils.writeLocales(collection.build.locales, collection.build.localesFolder)
    const snippetFilesWritePromises = allComponents.map(component =>
      FileUtils.writeFile(join(collection.build.snippetsFolder, `${component.name}.liquid`), component.build.liquidCode))

    const allAssetFiles = this.#getAssetFiles(allComponents)
    const copyAssetsPromise = FileUtils.copyFilesToFolder(allAssetFiles, collection.build.assetsFolder)

    const promises = [
      FileUtils.writeFile(collection.build.stylesheet, collection.build.styles),
      localesWritePromise,
      ...snippetFilesWritePromises,
      copyAssetsPromise
    ]

    if (collection.importMapEntries?.size) {
      promises.push(this.#deployImportMapFiles(collection.importMapEntries, collection.build.assetsFolder))
    }

    return Promise.all(promises)
  }

  /**
   * Deploy import map files to the assets folder
   * @param {Map<string, string>} buildEntries
   * @param {string} assetsFolder
   */
  static async #deployImportMapFiles (buildEntries, assetsFolder) {
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
   * Retrieves asset files from an array of Component or Snippet objects.
   *
   * @param {(Component|Snippet)[]} components - An array of components or snippets.
   * @return {string[]} - An array of asset files.
   */
  static #getAssetFiles (components) {
    return components
      .filter(component => component.files.assetFiles?.length)
      .flatMap(component => component.files.assetFiles)
  }

  /**
   * Get Collection JavaScript Files
   * @param {(Component|Snippet)[]} components
   * @return {string[]}
   */
  static #getJsFiles (components) {
    return components
      .filter(component => component.files.javascriptIndex)
      .map(component => component.files.javascriptIndex)
  }

  /**
   * Get Main Stylesheets from all components and snippets
   * @param {(Component|Snippet)[]} components
   * @return {string[]}
   */
  static #getMainStylesheets (components) {
    return components
      .filter(component => component.files.mainStylesheet)
      .map(component => component.files.mainStylesheet)
  }

  /**
   * Reset Collection Build Folders
   * @param {CollectionBuild} build
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async #resetBuildFolders (build) {
    await rm(build.rootFolder, { force: true, recursive: true })
    await mkdir(build.rootFolder, { recursive: true })

    const buildFolders = [
      build.assetsFolder,
      build.configFolder,
      build.localesFolder,
      build.sectionsFolder,
      build.snippetsFolder
    ]
    const mkdirPromises = buildFolders.map(buildFolder => mkdir(buildFolder, { recursive: true }))

    return Promise.all(mkdirPromises)
  }
}

export default CollectionBuilder
