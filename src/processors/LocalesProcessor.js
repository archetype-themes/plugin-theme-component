import { execSync } from 'node:child_process'
import { basename, join } from 'node:path'
import liquidParser from '@shopify/liquid-html-parser'
import { get, set } from 'lodash-es'
import FileUtils from '../utils/FileUtils.js'
import logger, { logChildItem, logTitleItem } from '../utils/Logger.js'
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
    liquidCodeElements = Array.isArray(liquidCodeElements) ? liquidCodeElements : [liquidCodeElements]
    sourceInstallFolder = join(sourceInstallFolder, '.locales')

    const localeFiles = await this.setupLocalesDatabase(source, sourceInstallFolder)
    const availableLocales = await this.parseLocaleFilesContent(localeFiles)
    const translationKeys = (
      await Promise.all(
        liquidCodeElements.map(async (code) => this.#getTranslationKeys(code))
      )).flat()

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

    for (const locale in availableLocales) {
      translationKeys.forEach(key => {
        const fullKey = `${locale}.${key}`
        const value = get(availableLocales, fullKey)

        if (value) {
          set(filteredLocales, fullKey, value)
        } else {
          logger.warn(`Translation missing "${key}" for the "${locale}" locale.`)
        }
      })
    }

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
    logTitleItem('Searching For An Existing Locales Setup')

    if (await FileUtils.exists(join(localesFolder, '.git'))) {
      // 1 -> The locales folder exists, and it is a git repo
      logChildItem('Locales Setup Found: It is a git repository')
      logChildItem('Initiating locales repository cleanup & update')

      // Restores modified files to their original version
      execSync('git restore . --quiet', { cwd: localesFolder })
      execSync('git pull --quiet', { cwd: localesFolder })
      logChildItem('Locales Setup Cleanup & Update Complete')
    } else if (!await FileUtils.exists(localesFolder)) {
      // 2 -> The locales folder doesn't exist
      if (isRepoUrl(localesRepoOption)) {
        logChildItem('No Locales Setup Found; Starting Download')
        execSync(`git clone ${localesRepoOption} ${localesFolder} --quiet`)
        logChildItem('Download Complete')
      } else {
        logChildItem('No Locales Setup Found, starting copy from local folder')
        await FileUtils.copyFolder(localesRepoOption, localesFolder, { recursive: true })
        logChildItem('Copy Finished')
      }
    } else {
      logChildItem('Locales Setup Found: Not a git repository.')
    }

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
