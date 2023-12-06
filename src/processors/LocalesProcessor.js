import { basename, extname } from 'node:path'
import liquidParser from '@shopify/liquid-html-parser'
import merge from 'deepmerge'
import ComponentFilesUtils from '../utils/ComponentFilesUtils.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'

export default class LocalesProcessor {
  /**
   *
   * @param {string|string[]} liquidCode
   * @param {string} localesRepo
   */
  static async build (liquidCode, localesRepo) {
    const liquidCodeElements = Array.isArray(liquidCode) ? liquidCode : [liquidCode]

    const translationKeys = await Promise.all(
      liquidCodeElements.flatMap(
        async (code) => LocalesProcessor.#getTranslationKeys(code)
      )
    )

    // const translations = await localesRepo.getTranslations(translationKeys)

    // return translations
  }

  /**
   * getTranslationKeys method extracts the translation keys from given liquid code.
   * @param {string} liquidCode - The liquid code to be searched for translation keys.
   * @returns {string[]} An array of unique translation keys found in the given liquid code.
   */
  static #getTranslationKeys (liquidCode) {
    const translationKeys = []

    const liquidAst = liquidParser.toLiquidHtmlAST(liquidCode, { mode: 'tolerant' })

    // Find Variables With A 't' Filter
    liquidParser.walk(liquidAst, (node) => {
      if (node.type === 'LiquidVariable' && node.filters.length) {
        const translateFilter = node.filters.find(liquidFilter => liquidFilter.name === 't')
        if (translateFilter) {
          if (node.expression.value) {
            translationKeys.push(node.expression.value)
          } else {
            logger.error(`Incompatible translation syntax for variable ${node.expression.name}. Try to add the 't' filter at variable definition time instead of at execution time.`)
          }
        }
      }
    })

    // Remove duplicates
    return [...new Set(translationKeys)]
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
}
