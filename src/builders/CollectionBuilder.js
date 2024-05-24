// External Dependencies
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

// Internal Dependencies
import { LOCALES_FOLDER_NAME } from '../config/Components.js'
import { collectionBuildFactory } from '../factory/collectionBuildFactory.js'
import Timer from '../models/Timer.js'
import Session from '../models/static/Session.js'
import LocalesProcessor from '../processors/LocalesProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import { copyFilesToFolder, getFolderFilesRecursively, saveFile } from '../utils/FileUtils.js'
import { writeLocales } from '../utils/LocaleUtils.js'
import { error, fatal, logChildItem, warn } from '../utils/LoggerUtils.js'
import { downloadFiles, isUrl } from '../utils/WebUtils.js'
import { ChangeType } from '../utils/Watcher.js'
import { FileTypes, getCopyright } from '../utils/ComponentFilesUtils.js'
import ImportMapProcessor from '../processors/javascript/ImportMapProcessor.js'

class CollectionBuilder {
  /**
   * Build Collection
   * @param {module:models/Collection} collection
   * @return {Promise<module:models/Collection>}
   */
  static async runProcessors(collection) {
    const allComponents = collection.allComponents

    collection.build = collectionBuildFactory(collection)

    if (Session.firstRun) {
      await this.#resetBuildFolders(collection.build)
      ;[collection.importMapEntries, collection.build.locales, collection.build.styles] = await Promise.all([
        this.#buildJavaScript(allComponents, collection.build.importMapFile, collection.rootFolder),
        this.#buildLocales(allComponents),
        this.#buildStyles(allComponents, collection.build.stylesheet, collection.copyright)
      ])
    } else {
      switch (Session.changeType) {
        case ChangeType.JavaScript:
          collection.importMapEntries = await this.#buildJavaScript(
            allComponents,
            collection.build.importMapFile,
            collection.rootFolder
          )
          break
        case ChangeType.Locale:
          collection.build.locales = await this.#buildLocales(allComponents)
          break
        case ChangeType.Stylesheet:
          collection.build.styles = await this.#buildStyles(allComponents, collection.build.stylesheet)
          break
      }
    }

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
  static async #buildJavaScript(components, importMapFile, cwd) {
    const jsFiles = this.#getJsFiles(components)

    if (jsFiles.length) {
      logChildItem('Starting The Import Map Processor', 1)
      const timer = new Timer()
      const importMapEntries = await ImportMapProcessor.build(jsFiles, importMapFile, cwd)
      logChildItem(`Import Map Processor Done (${timer.now()} seconds)`, 1)
      return importMapEntries
    } else {
      warn('No Javascript Files Found. Import Map Build Process Was Skipped.')
    }
  }

  /**
   * Builds locales for the given collection and all components.
   *
   * @param {(Component|Snippet)[]} components - All components to extract liquid code from.
   * @throws Error When build is in error
   * @return {Promise<{}>} - A promise that resolves when the locales are built.
   */
  static async #buildLocales(components) {
    const componentsLiquidCode = components.map((component) => component.liquidCode)
    try {
      logChildItem('Starting The Locales Processor', 1)
      const timer = new Timer()
      const localeFiles = await getFolderFilesRecursively(join(Session.localesPath, LOCALES_FOLDER_NAME))
      const locales = await LocalesProcessor.build(componentsLiquidCode, localeFiles)
      logChildItem(`Locales Processor Done (${timer.now()} seconds)`, 1)
      return locales
    } catch (e) {
      error('!!!TIP!!! For JSON parsing errors, use debug flag to view the name of the file in error')
      fatal('Error Building Locales: ', e)
    }
  }

  /**
   * Builds the styles for the given collection and all components.
   * @param {(Component|Snippet)[]} components - An array containing all the components.
   * @param {string} outputFile - The collection's css bundle file.
   * @param {string} [copyright] - The collection's Copyright Text
   * @return {Promise<string>} - A promise that resolves when the styles are built.
   */
  static async #buildStyles(components, outputFile, copyright) {
    const mainStylesheets = this.#getMainStylesheets(components)

    if (mainStylesheets.length) {
      logChildItem('Starting The Styles Processor', 1)
      const timer = new Timer()

      let styles = await StylesProcessor.buildStylesBundle(mainStylesheets, outputFile)
      styles = getCopyright(FileTypes.Css, copyright) + styles
      await saveFile(outputFile, styles)
      logChildItem(`Styles Processor Done (${timer.now()} seconds)`, 1)
      return styles
    }
  }

  /**
   * Deploy Collection To Folder
   * @param {module:models/Collection} collection
   * @return {Promise<Awaited<void>[]>}
   */
  static async deployToBuildFolder(collection) {
    const allComponents = collection.allComponents
    const promises = []

    if (Session.firstRun || Session.changeType === ChangeType.Locale) {
      const localesWritePromise = writeLocales(collection.build.locales, collection.build.localesFolder)
      promises.push(localesWritePromise)
    }

    if (collection.build.styles && (Session.firstRun || Session.changeType === ChangeType.Stylesheet)) {
      const stylesheetSavePromise = saveFile(collection.build.stylesheet, collection.build.styles)
      promises.push(stylesheetSavePromise)
    }

    if (Session.firstRun || [ChangeType.Asset, ChangeType.JavaScript].includes(Session.changeType)) {
      const allAssetFiles = this.#getAssetFiles(allComponents)
      const copyAssetFilesPromise = copyFilesToFolder(allAssetFiles, collection.build.assetsFolder)
      promises.push(copyAssetFilesPromise)
    }

    if (Session.firstRun || Session.changeType === ChangeType.Liquid) {
      const snippetFilesWritePromises = Promise.all(
        allComponents.map((component) =>
          saveFile(join(collection.build.snippetsFolder, `${component.name}.liquid`), component.build.liquidCode)
        )
      )
      promises.push(snippetFilesWritePromises)
    }
    console.log(collection.importMapEntries)
    if (collection.importMapEntries?.size && (Session.firstRun || Session.changeType === ChangeType.JavaScript)) {
      const deployImportMapFilesPromises = this.#deployImportMapFiles(
        collection.importMapEntries,
        collection.build.assetsFolder
      )
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
  static async #deployImportMapFiles(buildEntries, assetsFolder) {
    const localFiles = []
    const remoteFiles = []
    for (const [, modulePath] of buildEntries) {
      if (isUrl(modulePath)) {
        remoteFiles.push(modulePath)
      } else {
        localFiles.push(modulePath)
      }
    }
    const copyPromiseAll = copyFilesToFolder(localFiles, assetsFolder)
    const downloadPromiseAll = downloadFiles(remoteFiles, assetsFolder)
    return Promise.all([copyPromiseAll, downloadPromiseAll])
  }

  /**
   * Retrieves asset files from an array of Component or Snippet objects.
   *
   * @param {(Component|Snippet)[]} components - An array of components or snippets.
   * @return {string[]} - An array of asset files.
   */
  static #getAssetFiles(components) {
    return components
      .filter((component) => component.files.assetFiles?.length)
      .flatMap((component) => component.files.assetFiles)
  }

  /**
   * Get Collection JavaScript Files
   * @param {(Component|Snippet)[]} components
   * @return {string[]}
   */
  static #getJsFiles(components) {
    return components
      .filter((component) => component.files.javascriptIndex)
      .map((component) => component.files.javascriptIndex)
  }

  /**
   * Get Main Stylesheets from all components and snippets
   * @param {(Component|Snippet)[]} components
   * @return {string[]}
   */
  static #getMainStylesheets(components) {
    return components
      .filter((component) => component.files.mainStylesheet)
      .map((component) => component.files.mainStylesheet)
  }

  /**
   * Reset Collection Build Folders
   * @param {CollectionBuild} build
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async #resetBuildFolders(build) {
    await rm(build.rootFolder, { force: true, recursive: true })
    await mkdir(build.rootFolder, { recursive: true })

    const buildFolders = [
      build.assetsFolder,
      build.configFolder,
      build.localesFolder,
      build.sectionsFolder,
      build.snippetsFolder
    ]
    const mkdirPromises = buildFolders.map((buildFolder) => mkdir(buildFolder, { recursive: true }))

    return Promise.all(mkdirPromises)
  }
}

export default CollectionBuilder
