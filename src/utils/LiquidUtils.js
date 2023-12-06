import liquidParser from '@shopify/liquid-html-parser'
import FileUtils from './FileUtils.js'
import InputFileError from '../errors/InputFileError.js'

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
