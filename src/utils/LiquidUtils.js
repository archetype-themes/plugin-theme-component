import liquidParser from '@shopify/liquid-html-parser'
import logger from './Logger.js'
import InputFileError from '../errors/InputFileError.js'
import SvgProcessor from '../processors/SvgProcessor.js'
import FileUtils from './FileUtils.js'

class LiquidUtils {
  /**
   * Finds snippet names from render tags in liquid code
   * @param {string} liquidCode
   * @returns {string[]}
   */
  static getSnippetNames (liquidCode) {
    const snippetNames = []

    const liquidAst = liquidParser.toLiquidHtmlAST(liquidCode, { mode: 'tolerant' })
    liquidParser.walk(liquidAst, (node) => {
      if (node.type === 'LiquidTag' && node.name === 'render' && node.markup.snippet?.value) {
        snippetNames.push(node.markup.snippet.value)
      }
    })

    // Remove duplicates
    return [...new Set(snippetNames)]
  }

  /**
   * getTranslationKeys method extracts the translation keys from given liquid code.
   * @param {string} liquidCode - The liquid code to be searched for translation keys.
   * @returns {string[]} An array of unique translation keys found in the given liquid code.
   */
  static getTranslationKeys (liquidCode) {
    const translationKeys = []

    const liquidAst = liquidParser.toLiquidHtmlAST(liquidCode, { mode: 'tolerant' })

    // Find Variables With A 't' Filter
      liquidParser.walk(liquidAst, (node) => {
        if (node.type === 'LiquidVariable' && node.filters.length) {
          const translateFilter = node.filters.find(liquidFilter => liquidFilter.name === 't')
          if(translateFilter){
            if(node.expression.value){
              translationKeys.push(node.expression.value)
            }else{
              logger.error(`Incompatible translation syntax for variable ${node.expression.name}. Try to add the 't' filter at variable definition time instead of at execution time.`)
            }
          } 
        }
    })

    // Remove duplicates
    return [...new Set(translationKeys)]
  }

  /**
   * Generate Javascript File Reference for Shopify Liquid Code
   * @param {string} javascriptFile - Javascript file basename
   * @param {boolean} [async=true] - Optional asynchronous load of the javascript file, defaults to true
   * @return {string}
   */
  static generateJavascriptFileReference (javascriptFile, async = true) {
    if (async) {
      return `<script src="{{ '${javascriptFile}' | asset_url }}" async></script>`
    }
    return `<script src="{{ '${javascriptFile}' | asset_url }}"></script>`
  }

  /**
   * Generate Stylesheet Reference for Shopify Liquid Code
   * @param {string} stylesheetName - stylesheet basename
   * @param {boolean} [preload=false] - Optionally preload the stylesheet, defaults to false
   * @return {string}
   */
  static generateStylesheetReference (stylesheetName, preload = false) {
    if (preload) {
      return `{{ '${stylesheetName}' | global_asset_url | stylesheet_tag: preload: ${preload} }}`
    }
    return `{{ '${stylesheetName}' | global_asset_url | stylesheet_tag }}`
  }

  /**
   * Build Liquid Code
   * @param {string} name
   * @param {string} liquidCode
   * @param{string} collectionRootFolder
   * @return {Promise<string>}
   */
  static async buildLiquid (name, liquidCode, collectionRootFolder) {
    let buildLiquidCode = liquidCode
    // Process as SVG if applicable
    if (name.startsWith('icon-') || name.endsWith('-svg') || name.endsWith('.svg')) {
      buildLiquidCode = SvgProcessor.buildSvg(name, liquidCode, collectionRootFolder)
    }

    return buildLiquidCode
  }

  /**
   *
   * @param {liquidParser.LiquidHTMLASTParsingError} error
   * @param {string} liquidFile
   */
  static handleLiquidParsingError (error, liquidFile) {
    throw new InputFileError(`Liquid Error in ${FileUtils.convertToComponentRelativePath(liquidFile)}
        ╚══▶ ${error.message}
        ╚══▶ Begins at line ${error.loc.start.line}, column ${error.loc.start.column}
        ╚══▶ Ends at line ${error.loc.end.line}, column ${error.loc.end.column}`)
  }
}

export default LiquidUtils
