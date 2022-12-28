import path from 'path'
import FileUtils from './FileUtils.js'
import merge from 'deepmerge'

class LocaleUtils {
  /**
   * Parse Locale Files into an object
   * @param {string[]} localeFiles
   * @return {Promise<string[]|Object<string, Object<string, string>>>}
   */
  static async parseLocaleFilesContent (localeFiles) {
    let locales
    if (localeFiles.length > 0) {
      if (localeFiles[0].endsWith('.schema.json')) {
        locales = []
      } else {
        locales = {}
      }
    }

    const singleLocaleFileRegex = /^(?<locale>([a-z]{2})(-[a-z]{2}))?(\.default)?(\.schema)?\.json$/

    for (const localeFileWithPath of localeFiles) {
      const localeFileName = path.basename(localeFileWithPath).toLowerCase()

      const singleLocaleMatch = localeFileName.match(singleLocaleFileRegex)

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

      }
      // We have a single file with multiple locales
      else if (localeFileName.match(/^locales?(\.schema)?\.json$/)) {
        // Load locales.json file
        const localesData = JSON.parse(await FileUtils.getFileContents(localeFileWithPath))

        // merge locales
        locales = merge(locales, localesData)
      }
    }

    return locales
  }
}

export default LocaleUtils
