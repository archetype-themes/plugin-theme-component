import FileUtils from './FileUtils.js'

class LiquidUtils {

  /**
   * Finds render tags in liquid code and create Render models
   * @param {string} liquidCode
   * @returns {RegExpMatchArray[]}
   */
  static findRenderTags (liquidCode) {
    const regex = /\{%-?\s+render\s+'(?<snippet>[\p{L}_. -]+)'(?:\s*(?<clause>for|with)\s+(?<clauseSourceVariable>\w+[.\w]+)\s+as\s+(?<clauseTargetVariable>\w+))?(?<variables>(?:\s*,\s*\w+:\s*(\w[.\w]+\w|'[^']+'))*)\s+-?%\}/giu
    return [...liquidCode.matchAll(regex)]
  }

  /**
   * Get Snippet Inline Liquid Code
   * Adds appropriate variables when necessary ahead of the liquid code
   * @param {string} sourceLiquidCode
   * @param {Render} render
   * @returns {Promise<string>}
   */
  static async prepareSnippetInlineLiquidCode (sourceLiquidCode, render) {
    let buildLiquidCode = sourceLiquidCode
    // Process "With" clause variable
    if (render.hasWithClause() && render.clauseSourceVariable !== render.clauseTargetVariable) {
      buildLiquidCode =
        `{% assign ${render.clauseTargetVariable} = ${render.clauseSourceVariable} %}\n${buildLiquidCode}`
    }

    // Process additional variables
    for (const renderVariable in render.variables) {
      if (renderVariable !== render.variables[renderVariable]) {
        buildLiquidCode = `{% assign ${renderVariable} = ${render.variables[renderVariable]} %}\n${buildLiquidCode}`
      }
    }

    return buildLiquidCode
  }
}

export default LiquidUtils
