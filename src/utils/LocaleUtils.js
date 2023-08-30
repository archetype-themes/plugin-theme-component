// Node.js imports
import { writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

// External imports
import merge from 'deepmerge'
import { extname } from 'path'
import NodeConfig from '../cli/models/NodeConfig.js'

// Internal Imports
import ComponentFilesUtils from './ComponentFilesUtils.js'
import FileUtils from './FileUtils.js'

class LocaleUtils {
  /**
   * Build Locales
   * @param {string} componentName
   * @param {Object} [locales={}]
   * @param {Object} [localesFromSectionSchema={}]
   * @param {boolean} [isSnippet]
   * @return {{}|null}
   */
  static buildLocales (componentName, locales = {}, localesFromSectionSchema, isSnippet = false) {
    let buildLocales
    let buildLocalesFromSectionSchema

    if (locales) {
      buildLocales = NodeConfig.embedLocales ? LocaleUtils.prefixLocalesWithComponentName(componentName, locales, isSnippet) : locales
    }

    if (localesFromSectionSchema) {
      buildLocalesFromSectionSchema = NodeConfig.embedLocales ? LocaleUtils.prefixLocalesWithComponentName(componentName, localesFromSectionSchema, isSnippet) : localesFromSectionSchema
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
          localeData = JSON.parse(await FileUtils.getFileContents(localeFileWithPath))
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
          localesData = JSON.parse(await FileUtils.getFileContents(localeFileWithPath))
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
      const localeFilename = join(localesFolder, `${locale}${schemaSuffix}.json`)
      const localeJsonString = JSON.stringify(locales[locale], null, 2)
      promises.push(writeFile(localeFilename, localeJsonString))
    }

    return Promise.all(promises)
  }
}

export default LocaleUtils
