import { basename, join } from 'node:path'
import { get, set } from 'lodash-es'
import { install } from '../utils/ExternalComponentUtils.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import { ERROR_LOG_LEVEL, logChildItem, WARN_LOG_LEVEL } from '../utils/Logger.js'

const TRANSLATION_KEYS_REGEX = /\s(\S+)\s*\|\s*t:?\s/g

export default class LocalesProcessor {
  /**
   * Build Locales
   * @param {string|string[]} liquidCodeElements
   * @param {string} source
   * @param {string} sourceInstallFolder
   * @returns {Promise<{}>}
   */
  static async build (liquidCodeElements, source, sourceInstallFolder) {
    const elements = Array.isArray(liquidCodeElements) ? liquidCodeElements : [liquidCodeElements]
    sourceInstallFolder = join(sourceInstallFolder, '.locales')

    const localeFiles = await this.setupLocalesDatabase(source, sourceInstallFolder)
    const availableLocales = await this.parseLocaleFilesContent(localeFiles)
    const translationKeys = elements.flatMap(code => this.#getTranslationKeys(code))

    return this.filterTranslations(availableLocales, translationKeys)
  }

  /**
   *
   * @param {Object} availableLocales
   * @param {string[]} translationKeys
   * @returns {Object}
   */
  static filterTranslations (availableLocales, translationKeys) {
    const filteredLocales = {}

    Object.keys(availableLocales).forEach(locale => {
      translationKeys.forEach(key => {
        const fullKey = `${locale}.${key}`
        const value = get(availableLocales, fullKey)

        if (value) {
          set(filteredLocales, fullKey, value)
        } else {
          logChildItem(`Translation missing "${key}" for the "${locale}" locale.`, WARN_LOG_LEVEL)
        }
      })
    })

    return filteredLocales
  }

  /**
   * getTranslationKeys method extracts the translation keys from given liquid code.
   * @param {string} liquidCode - The liquid code to be searched for translation keys.
   * @returns {string[]} An array of unique translation keys found in the given liquid code.
   */
  static #getTranslationKeys (liquidCode) {
    const cleanLiquidCode = LiquidUtils.stripComments(liquidCode)
    const translationKeys = new Set()

    let match
    while ((match = TRANSLATION_KEYS_REGEX.exec(cleanLiquidCode)) !== null) {
      const translationKey = match[1]

      if (translationKey.startsWith('\'') && translationKey.endsWith('\'')) {
        translationKeys.add(translationKey.slice(1, -1))
      } else {
        logChildItem(`(1/2) Incompatible translation syntax for variable ${translationKey}.`, ERROR_LOG_LEVEL)
        logChildItem(`(2/2) You must use the 't' filter at when defining ${translationKey} instead of when using it.`, ERROR_LOG_LEVEL)
      }
    }

    return [...translationKeys]
  }

  static async setupLocalesDatabase (localesRepoOption, localesFolder) {
    await install(localesRepoOption, localesFolder, 'Locales DB')
    return FileUtils.getFolderFilesRecursively(localesFolder)
  }

  /**
   * Parse Locale Files into an object
   * @param {string[]} localeFiles
   * @return {Promise<{}>}
   */
  static async parseLocaleFilesContent (localeFiles) {
    const locales = {}

    const localeFileRegex = /^(?<locale>([a-z]{2})(-[a-z]{2})?)(\.default)?\.json$/

    for (const file of localeFiles) {
      const fileName = basename(file).toLowerCase()

      if (localeFileRegex.test(fileName)) {
        const locale = fileName.match(localeFileRegex).groups.locale
        locales[locale] = await FileUtils.getJsonFileContents(file)
      }
    }
    return locales
  }
}
