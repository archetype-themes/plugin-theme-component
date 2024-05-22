// External Dependencies
import { basename } from 'node:path'
import { get, set } from 'lodash-es'

// Internal Dependencies
import { getJsonFileContents } from '../utils/FileUtils.js'
import { stripComments } from '../utils/LiquidUtils.js'
import { error, warn } from '../utils/LoggerUtils.js'

const TRANSLATION_KEYS_REGEX = /\s(\S+)\s*\|\s*t:?\s/g

export default class LocalesProcessor {
  /**
   * Build Locales
   * @param {string|string[]} componentsLiquidCode - Raw liquid code strings
   * @param {string[]} localeFiles - Path to locale files
   * @returns {Promise<Object>}
   */
  static async build(componentsLiquidCode, localeFiles) {
    const elements = Array.isArray(componentsLiquidCode) ? componentsLiquidCode : [componentsLiquidCode]

    const availableLocales = await this.parseLocaleFilesContent(localeFiles)
    const translationKeys = elements.flatMap((code) => this.#getTranslationKeys(code))

    return this.filterTranslations(availableLocales, translationKeys)
  }

  /**
   * Filter Translations
   * @param {Object} availableLocales
   * @param {string[]} translationKeys
   * @returns {Object}
   */
  static filterTranslations(availableLocales, translationKeys) {
    const filteredLocales = {}
    /** @type {Map<string,Set>} **/
    const missingLocales = new Map()

    Object.keys(availableLocales).forEach((locale) => {
      translationKeys.forEach((key) => {
        const fullKey = `${locale}.${key}`
        const value = get(availableLocales, fullKey)

        if (value) {
          set(filteredLocales, fullKey, value)
        } else {
          if (!missingLocales.has(key)) {
            missingLocales.set(key, new Set())
          }
          if (!missingLocales.get(key).has(locale)) {
            missingLocales.get(key).add(locale)
          }
        }
      })
    })

    const sortedMissingLocales = [...missingLocales.entries()].sort((a, b) => a[0].localeCompare(b[0]))

    sortedMissingLocales.forEach(([translationKey, locales]) => {
      locales.forEach((locale) => {
        warn(`Translation missing "${translationKey}" for the "${locale}" locale.`)
      })
    })

    return filteredLocales
  }

  /**
   * Get Translation Keys
   * Extracts the translation keys from given liquid code.
   * @param {string} liquidCode - The liquid code to be searched for translation keys.
   * @returns {string[]} An array of unique translation keys found in the given liquid code.
   */
  static #getTranslationKeys(liquidCode) {
    const cleanLiquidCode = stripComments(liquidCode)
    const translationKeys = new Set()

    let match
    while ((match = TRANSLATION_KEYS_REGEX.exec(cleanLiquidCode)) !== null) {
      const translationKey = match[1]

      if (translationKey.startsWith("'") && translationKey.endsWith("'")) {
        translationKeys.add(translationKey.slice(1, -1))
      } else {
        error(
          `Incompatible translation syntax for variable ${translationKey}. You must use the 't' filter at when defining ${translationKey} instead of when using it.`
        )
      }
    }

    return [...translationKeys]
  }

  /**
   * Parse Locale Files Content into an object
   * @param {string[]} localeFiles
   * @return {Promise<{}>}
   */
  static async parseLocaleFilesContent(localeFiles) {
    const locales = {}

    const localeFileRegex = /^(?<locale>([a-z]{2})(-[a-z]{2})?)(\.default)?\.json$/

    for (const file of localeFiles) {
      const fileName = basename(file).toLowerCase()

      if (localeFileRegex.test(fileName)) {
        const locale = RegExp(localeFileRegex).exec(fileName).groups.locale
        locales[locale] = await getJsonFileContents(file)
      }
    }
    return locales
  }
}
