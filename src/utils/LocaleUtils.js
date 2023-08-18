import { writeFile } from 'node:fs/promises'
import path from 'path'

import FileUtils from './FileUtils.js'
import merge from 'deepmerge'

class LocaleUtils {
  /**
   * Build Locales
   * @param {string} componentName
   * @param {Object} [locales={}]
   * @param {Object} [localesFromSchema={}]
   * @param {boolean} [isSnippet]
   * @return {{}|null}
   */
  static buildLocales (componentName, locales = {}, localesFromSchema, isSnippet = false) {
    let buildLocales
    let buildLocalesFromSectionSchema

    if (locales) {
      buildLocales = LocaleUtils.prefixLocalesWithComponentName(componentName, locales, isSnippet)
    }

    if (localesFromSchema) {
      buildLocalesFromSectionSchema = LocaleUtils.prefixLocalesWithComponentName(componentName, localesFromSchema, isSnippet)
    }

    if (buildLocalesFromSectionSchema && buildLocales) {
      return merge(buildLocalesFromSectionSchema, buildLocales)
    }
    if (buildLocales) {
      return buildLocales
    }
    if (buildLocalesFromSectionSchema) {
      return buildLocalesFromSectionSchema
    }
    return null
  }

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
   * Prefix Locales Object with Component Name
   * @param {string} componentName
   * @param {Object} [locales]
   * @param {boolean} [isSnippet=false] Defaults to false. It will use sections prefix, or snippets when true
   * @returns {{}|null}
   */
  static prefixLocalesWithComponentName (componentName, locales, isSnippet = false) {
    if (locales) {
      const componentPrefix = isSnippet ? 'snippets' : 'sections'
      const prefixedLocales = {}
      for (const locale of Object.keys(locales)) {
        prefixedLocales[locale] = {
          [componentPrefix]: {
            [componentName]: locales[locale]
          }
        }
      }
      return prefixedLocales
    }
    return null
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
