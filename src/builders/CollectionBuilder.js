// External Dependencies
import { join } from 'node:path'

// Internal Dependencies
import { LOCALES_FOLDER_NAME } from '../config/Components.js'
import { collectionBuildFactory } from '../factory/collectionBuildFactory.js'
import Timer from '../models/Timer.js'
import Session from '../models/static/Session.js'
import LocalesProcessor from '../processors/LocalesProcessor.js'
import PostCSSProcessor from '../processors/PostCSSProcessor.js'
import { getFolderFilesRecursively } from '../utils/FileUtils.js'
import { error, fatal, logChildItem, warn } from '../utils/LoggerUtils.js'
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
    collection.build = collectionBuildFactory(collection)

    if (Session.firstRun) {
      ;[collection.build.importMap, collection.build.locales, collection.build.styles] = await Promise.all([
        this.#buildJavaScript(collection.jsIndexes, collection.rootFolder),
        this.#buildLocales(collection.liquidCode),
        this.#buildStyles(collection.mainStylesheets, collection.copyright)
      ])
    } else {
      switch (Session.changeType) {
        case ChangeType.JavaScript:
          collection.build.importMap = await this.#buildJavaScript(collection.jsIndexes, collection.rootFolder)
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
   * @param {string[]} jsFiles - JavaScript Files
   * @param {string} cwd - The working directory.
   * @returns {Promise<{entries: Map<string, string>, tags: string}>}
   */
  static async #buildJavaScript(jsFiles, cwd) {
    if (jsFiles.length) {
      logChildItem('Starting The Import Map Processor', 1)
      const timer = new Timer()
      const importMap = await ImportMapProcessor.build(jsFiles, cwd)
      logChildItem(`Import Map Processor Done (${timer.now()} seconds)`, 1)
      return importMap
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
