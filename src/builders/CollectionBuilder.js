// Node imports
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

// Internal Imports
import BuildFactory from '../factory/BuildFactory.js'
import Session from '../models/static/Session.js'
import LocalesProcessor from '../processors/LocalesProcessor.js'
import { install } from '../utils/ExternalComponentUtils.js'
import FileUtils, { getFolderFilesRecursively } from '../utils/FileUtils.js'
import { exitWithError } from '../utils/NodeUtils.js'
import WebUtils, { isRepoUrl } from '../utils/WebUtils.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import LocaleUtils from '../utils/LocaleUtils.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import Timer from '../models/Timer.js'
import logger, { DEBUG_LOG_LEVEL, WARN_LOG_LEVEL } from '../utils/Logger.js'
import { logChildItem } from '../utils/LoggerUtils.js'
import { LOCALES_FOLDER_NAME, LOCALES_INSTALL_FOLDER } from '../config/Components.js'
import { cwd } from 'node:process'

class CollectionBuilder {
  /**
   * Build Collection
   * @param {module:models/Collection} collection
   * @return {Promise<module:models/Collection>}
   */
  static async build (collection) {
    const allComponents = collection.allComponents

    const timer = new Timer()
    collection.build = BuildFactory.fromCollection(collection)
    if (Session.firstRun) {
      await this.#resetBuildFolders(collection.build)
    }
    logChildItem(`Collection Build Initialized (${timer.now()} seconds)`);

    [collection.importMapEntries, collection.build.locales, collection.build.styles] = await Promise.all([
      this.#buildJavaScript(allComponents, collection.build.importMapFile, collection.rootFolder),
      this.#buildLocales(allComponents),
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
   * @return {Promise<Map<string, string>>} - A promise that resolves when the JavaScript files have been built.
   */
  static async #buildJavaScript (components, importMapFile, cwd) {
    const jsFiles = this.#getJsFiles(components)

    if (jsFiles.length) {
      logChildItem('Running the Import Map Processor')
      const timer = new Timer()
      const importMapEntries = await JavaScriptProcessor.buildJavaScript(jsFiles, importMapFile, cwd)
      logChildItem(`Import Map Processor completed in ${timer.now()} seconds`)
      return importMapEntries
    } else {
      logChildItem('No Javascript Files Found. Javascript Build Process Was Skipped.', WARN_LOG_LEVEL)
    }
  }

  /**
   * Builds locales for the given collection and all components.
   *
   * @param {(Component|Snippet)[]} components - All components to extract liquid code from.
   * @throws Error When build is in error
   * @return {Promise<{}>} - A promise that resolves when the locales are built.
   */
  static async #buildLocales (components) {
    const componentsLiquidCode = components.map(component => component.liquidCode)
    try {
      logChildItem('Running the Locales Processor')
      const timer = new Timer()

      let localesPath
      if (isRepoUrl(Session.localesPath)) {
        const localesInstallPath = join(cwd(), LOCALES_INSTALL_FOLDER)
        localesPath = localesInstallPath
        if (Session.firstRun) {
          await install(Session.localesPath, localesInstallPath, 'Locales DB')
        }
      } else {
        localesPath = Session.localesPath
      }

      const localeFiles = await getFolderFilesRecursively(join(localesPath, LOCALES_FOLDER_NAME))
      const locales = await LocalesProcessor.build(componentsLiquidCode, localeFiles)
      logChildItem(`Locales Processor completed in ${timer.now()} seconds`)
      return locales
    } catch (error) {
      logger.error('TIP: For JSON parsing errors, use debug flag to view the name of the file in error')
      exitWithError('Error Building Locales: ' + error.stack && logger.isLevelEnabled(DEBUG_LOG_LEVEL) ? error.stack : error.message)
    }
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
      logChildItem('Running the Styles Processor')
      const timer = new Timer()

      const styles = await StylesProcessor.buildStylesBundle(mainStylesheets, outputFile, cwd)
      logChildItem(`Styles Processor completed in ${timer.now()} seconds`)
      return styles
    }
  }

  /**
   * Deploy Collection To Folder
   * @param {module:models/Collection} collection
   * @return {Promise<Awaited<void>[]>}
   */
  static async deployToBuildFolder (collection) {
    const allComponents = collection.allComponents

    const localesWritePromise = LocaleUtils.writeLocales(collection.build.locales, collection.build.localesFolder)
    const snippetFilesWritePromises = Promise.all(allComponents.map(component =>
      FileUtils.saveFile(join(collection.build.snippetsFolder, `${component.name}.liquid`), component.build.liquidCode)))

    const allAssetFiles = this.#getAssetFiles(allComponents)
    const copyAssetFilesPromise = FileUtils.copyFilesToFolder(allAssetFiles, collection.build.assetsFolder)
    const stylesheetSavePromise = FileUtils.saveFile(collection.build.stylesheet, collection.build.styles ?? '')
    const promises = [
      stylesheetSavePromise,
      localesWritePromise,
      snippetFilesWritePromises,
      copyAssetFilesPromise
    ]

    if (collection.importMapEntries?.size) {
      const deployImportMapFilesPromises = this.#deployImportMapFiles(collection.importMapEntries, collection.build.assetsFolder)
      promises.push(deployImportMapFilesPromises)
    }

    return Promise.all(promises)
  }

  /**
   * Deploy import map files to the assets folder
   * @param {Map<string, string>} buildEntries
   * @param {string} assetsFolder
   * @return {Promise<Awaited<Awaited<void>[]>[]>}
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
    const copyPromiseAll = FileUtils.copyFilesToFolder(localFiles, assetsFolder)
    const downloadPromiseAll = WebUtils.downloadFiles(remoteFiles, assetsFolder)
    return Promise.all([copyPromiseAll, downloadPromiseAll])
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
