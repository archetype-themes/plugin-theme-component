import { writeFile } from 'node:fs/promises'
import path from 'path'

import FileUtils from './FileUtils.js'
import merge from 'deepmerge'

class LocaleUtils {
  /**
   * Parse Locale Files into an object
   * @param {string[]} localeFiles
   * @return {Promise<{}>}
   */
  static async parseLocaleFilesContent (localeFiles) {
    let locales = {}

    const singleLocaleFileRegex = /^(?<locale>([a-z]{2})(-[a-z]{2}))?(\.default)?(\.schema)?\.json$/

    for (const localeFileWithPath of localeFiles) {
      const localeFileName = path.basename(localeFileWithPath).toLowerCase()

      const singleLocaleMatch = singleLocaleFileRegex.exec(localeFileName)

      // We have a single locale in a distinctly named file
      if (singleLocaleMatch) {
        // Get locale from filename
        const locale = singleLocaleMatch.groups.locale

        // Merge with matching locale
        const localeData = JSON.parse(await FileUtils.getFileContents(localeFileWithPath))

        if (locales[locale]) {
          locales[locale] = merge(locales[locale], localeData)
        } else {
          locales[locale] = localeData
        }
      } else if (/^locales?(\.schema)?\.json$/.exec(localeFileName)) {
        // We have a single file with multiple locales
        // Load locales.json file
        const localesData = JSON.parse(await FileUtils.getFileContents(localeFileWithPath))

        // merge locales
        locales = merge(locales, localesData)
      }
    }

    return locales
  }

  /**
   * Write Schema Locales
   * @param {Object} locales
   * @param {string} localesFolder
   * @param {boolean} schemaLocales
   * @return {Promise<Awaited<void>[]>}
   */
  static async writeLocales (locales, localesFolder, schemaLocales = false) {
    const promises = []
    const schemaSuffix = schemaLocales ? '.schema' : ''

    // Create one file per locale key
    for (const locale of Object.keys(locales)) {
      const localeFilename = path.join(localesFolder, `${locale}${schemaSuffix}.json`)
      const localeJsonString = JSON.stringify(locales[locale], null, 2)
      promises.push(writeFile(localeFilename, localeJsonString))
    }

    return Promise.all(promises)
  }
}

export default LocaleUtils
