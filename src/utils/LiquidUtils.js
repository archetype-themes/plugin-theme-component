import FileUtils from './FileUtils.js'

class LiquidUtils {

  /**
   * Finds render tags in liquid code and create Render models
   * @param {string} liquidCode
   * @returns {RegExpMatchArray[]}
   */
  static findRenderTags (liquidCode) {
    const regex = /\{%\s+render\s+'(?<snippet>[\p{L}_. -]+)'(?:\s*(?<clause>for|with)\s+(?<clauseSourceVariable>\w+[.\w]+)\s+as\s+(?<clauseTargetVariable>\w+))?(?<variables>(?:\s*,\s*\w+:\s*'?\w+'?)*)\s+%\}/giu
    return [...liquidCode.matchAll(regex)]
  }

  /**
   *
   * @param {Render} render
   * @returns {Promise<string>}
   */
  static async getSnippetInlineLiquidCode (render) {
    let snippetLiquidCode
    if (render.snippet.liquidCode) {
      snippetLiquidCode = render.snippet.liquidCode
    } else {
      snippetLiquidCode = await FileUtils.getMergedFilesContent(render.snippet.files.liquidFiles)
    }

    // Process "With" clause variable
    if (render.hasWithClause() && render.clauseSourceVariable !== render.clauseTargetVariable) {
      snippetLiquidCode =
        `{% assign ${render.clauseTargetVariable} = ${render.clauseSourceVariable} %}\n${snippetLiquidCode}`
    }

    // Process additional variables
    for (const renderVariable in render.variables) {
      if (renderVariable !== render.variables[renderVariable]) {
        snippetLiquidCode = `{% assign ${renderVariable} = ${render.variables[renderVariable]} %}\n${snippetLiquidCode}`
      }
    }

    return snippetLiquidCode
  }
}

export default LiquidUtils
