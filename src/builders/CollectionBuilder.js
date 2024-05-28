// External Dependencies
import { join } from 'node:path'

// Internal Dependencies
import { LOCALES_FOLDER_NAME } from '../config/Components.js'
import { collectionBuildFactory } from '../factory/collectionBuildFactory.js'
import Timer from '../models/Timer.js'
import Session from '../models/static/Session.js'
import LocalesProcessor from '../processors/LocalesProcessor.js'
import PostCSSProcessor from '../processors/PostCSSProcessor.js'
import { error, fatal, logChildItem, warn } from '../utils/LoggerUtils.js'
import { downloadFiles, isUrl } from '../utils/WebUtils.js'
import { ChangeType } from '../utils/Watcher.js'
import { FileTypes, getCopyright } from '../utils/ComponentFilesUtils.js'
import ImportMapProcessor from '../processors/javascript/ImportMapProcessor.js'

class CollectionBuilder {
  /**
   * Build Collection
   * @param {module:models/Collection} collection
   * @returns {Promise<module:models/Collection>}
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
        this.#buildLocales(collection.liquidCode),
        this.#buildStyles(collection.mainStylesheets, collection.build.stylesheet, collection.copyright)
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
          collection.build.locales = await this.#buildLocales(collection.liquidCode)
          break
        case ChangeType.Stylesheet:
          collection.build.styles = await this.#buildStyles(collection.mainStylesheets, collection.build.stylesheet)
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
   * @param {string[]} liquidCodeExcerpts - Liquid code excerpts to scan for translation tag use
   * @throws Error When build fails
   * @returns {Promise<{}>} - A promise that resolves when the locales' build is complete
   */
  static async #buildLocales(liquidCodeExcerpts) {
    try {
      logChildItem('Starting The Locales Processor', 1)
      const timer = new Timer()
      const localeFiles = await getFolderFilesRecursively(join(Session.localesPath, LOCALES_FOLDER_NAME))
      const locales = await LocalesProcessor.build(liquidCodeExcerpts, localeFiles)
      logChildItem(`Locales Processor Done (${timer.now()} seconds)`, 1)
      return locales
    } catch (e) {
      error('!!!TIP!!! For JSON parsing errors, use debug flag to view the name of the file in error')
      fatal('Error Building Locales: ', e)
    }
  }

  /**
   * Builds the styles for the given collection and all components.
   * @param {string[]} mainStylesheets - Main Stylesheets
   * @param {string} [copyright] - The collection's Copyright Text
   * @returns {Promise<string>} - A promise that resolves when the styles are built.
   */
  static async #buildStyles(mainStylesheets, copyright) {
    if (mainStylesheets.length) {
      logChildItem('Starting The Styles Processor', 1)
      const timer = new Timer()

      let styles = await PostCSSProcessor.buildStylesBundle(mainStylesheets)
      styles = getCopyright(FileTypes.Css, copyright) + styles
      logChildItem(`Styles Processor Done (${timer.now()} seconds)`, 1)
      return styles
    }
  }
}

export default CollectionBuilder
