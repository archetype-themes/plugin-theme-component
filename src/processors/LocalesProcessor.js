import { basename, join } from 'node:path'
import liquidParser from '@shopify/liquid-html-parser'
import { get, set } from 'lodash-es'
import { install } from '../utils/ExternalComponentUtils.js'
import FileUtils from '../utils/FileUtils.js'
import { ERROR_LOG_LEVEL, logChildItem, WARN_LOG_LEVEL } from '../utils/Logger.js'

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
    const translationKeys = new Set()
    const liquidAst = liquidParser.toLiquidHtmlAST(liquidCode, { mode: 'tolerant' })

    // Find Variables With A "t" Filter
    liquidParser.walk(liquidAst, node => {
      if (node.type === 'LiquidVariable' && node.filters.some(filter => filter.name === 't')) {
        if (node.expression.value) {
          translationKeys.add(node.expression.value)
        } else {
          logChildItem(`(1/2) Incompatible translation syntax for variable ${node.expression.name}.`, ERROR_LOG_LEVEL)
          logChildItem(`(2/2) You must use the 't' filter at when defining ${node.expression.name} instead of when using it.`, ERROR_LOG_LEVEL)
        }
      }
    })

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

    const localeFileRegex = /^(?<locale>([a-z]{2})(-[a-z]{2})?)(\.default)?(\.schema)?\.json$/

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
