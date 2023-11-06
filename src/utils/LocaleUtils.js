// Node.js imports
import { writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

// External imports
import merge from 'deepmerge'

// Internal Imports
import ComponentFilesUtils from './ComponentFilesUtils.js'
import FileUtils from './FileUtils.js'

class LocaleUtils {
  /**
   * Build Locales
   * @param {string} componentName
   * @param {Object} [locales={}]
   * @param {boolean} [isSnippet]
   * @return {Object}
   */
  static buildLocales (componentName, locales = {}, isSnippet = false) {
    return locales
  }

  /**
   * Parse Locale Files into an object
   * @param {string[]} localeFiles
   * @return {Promise<{}>}
   */
  static async parseLocaleFilesContent (localeFiles) {
    let locales = {}

    const singleLocaleFileRegex = new RegExp(`^(?<locale>([a-z]{2})(-[a-z]{2}))?(\\.default)?(\\.schema)?\\.${ComponentFilesUtils.DATA_FILE_EXTENSIONS_REGEX_CAPTURE_GROUP}$`)
    const multiLocalesFileRegex = new RegExp(`^locales?(\\.schema)?\\.${ComponentFilesUtils.DATA_FILE_EXTENSIONS_REGEX_CAPTURE_GROUP}$`)

    for (const localeFileWithPath of localeFiles) {
      const localeFileName = basename(localeFileWithPath).toLowerCase()

      const singleLocaleMatch = singleLocaleFileRegex.exec(localeFileName)

      // We have a single locale in a distinctly named file
      if (singleLocaleMatch) {
        // Get locale from filename
        const locale = singleLocaleMatch.groups.locale

        let localeData
        if (extname(localeFileWithPath) === '.json') {
          localeData = await FileUtils.getJsonFileContents(localeFileWithPath)
        } else {
          localeData = (await import(localeFileWithPath)).default
        }

        // Merge with matching locale
        if (locales[locale]) {
          locales[locale] = merge(locales[locale], localeData)
        } else {
          locales[locale] = localeData
        }
        return locales
      }

      // We have a locales files regrouping multiple locales
      if (multiLocalesFileRegex.exec(localeFileName)) {
        // We have a single file with multiple locales
        // Load locales.json file
        let localesData
        if (extname(localeFileWithPath) === '.json') {
          localesData = await FileUtils.getJsonFileContents(localeFileWithPath)
        } else {
          localesData = (await import(localeFileWithPath)).default
        }

        // merge locales
        locales = merge(locales, localesData)
      }
    }

    return locales
  }

  /**
   * Write Locales
   * @param {Object} locales
   * @param {string} localesFolder
   * @return {Promise<Awaited<void>[]>}
   */
  static async writeLocales (locales, localesFolder) {
    const promises = []

    // Create one file per locale key
    for (const locale of Object.keys(locales)) {
      const localeFilename = join(localesFolder, `${locale}.json`)
      const localeJsonString = JSON.stringify(locales[locale], null, 2)
      promises.push(writeFile(localeFilename, localeJsonString))
    }

    return Promise.all(promises)
  }
}

export default LocaleUtils
