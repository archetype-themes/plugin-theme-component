import { basename, join } from 'node:path'
import liquidParser from '@shopify/liquid-html-parser'
import { get, set } from 'lodash-es'
import FileUtils from '../utils/FileUtils.js'
import { getTimer, getTimeElapsed } from '../utils/Timer.js'
import { clone, pull, restore } from '../utils/GitUtils.js'
import logger, { logChildItem } from '../utils/Logger.js'
import { isRepoUrl } from '../utils/WebUtils.js'

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
          logger.warn(`Translation missing "${key}" for the "${locale}" locale.`)
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
          logger.error(`Incompatible translation syntax for variable ${node.expression.name}. Try to add the 't' filter at variable definition time instead of at execution time.`)
        }
      }
    })

    return [...translationKeys]
  }

  static async setupLocalesDatabase (localesRepoOption, localesFolder) {
    logChildItem('Searching For An Existing Locales DB')
    const timer = getTimer()

    if (await FileUtils.exists(join(localesFolder, '.git'))) {
      logChildItem('Locales DB Found; git restore and git pull will run')
      restore(localesFolder)
      pull(localesFolder)
    } else if (!await FileUtils.exists(localesFolder)) {
      if (isRepoUrl(localesRepoOption)) {
        logChildItem('Locales DB Missing; Initiating Repo Download')
        clone(localesRepoOption, localesFolder)
      } else {
        logChildItem('Locales DB Missing; Initiating Copy From Source Folder')
        await FileUtils.copyFolder(localesRepoOption, localesFolder, { recursive: true })
      }
    } else {
      logChildItem('Locales DB Found')
    }
    logChildItem(`Locales Ready (${getTimeElapsed(timer)} seconds)`)

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
