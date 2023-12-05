import liquidParser from '@shopify/liquid-html-parser'
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
}
