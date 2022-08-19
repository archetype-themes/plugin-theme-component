import RenderFactory from '../factory/RenderFactory.js'
import FileUtils from './FileUtils.js'

class LiquidUtils {

  /**
   * Finds render tags in liquid code and create Render models
   * @param {string} liquidCode
   * @returns {Render[]}
   */
  static findRenders (liquidCode) {
    const regex = /\{%\s+render\s+'(?<snippet>[\p{L}_. -]+)'(?:\s*(?<clause>for|with)\s+(?<clauseSourceVariable>\w+[.\w]+)\s+as\s+(?<clauseTargetVariable>\w+))?(?<variables>(?:\s*,\s*\w+:\s*'?\w+'?)*)\s+%\}/giu
    const matches = [...liquidCode.matchAll(regex)]
    const renders = []

    for (const match of matches) {
      renders.push(RenderFactory.fromMatch(match[0], match.groups))
    }
    return renders
  }

  /**
   *
   * @param {Render} render
   * @returns {Promise<string>}
   */
  static async getRenderSnippetInlineLiquidCode (render) {
    let snippetLiquidCode
    if (render.snippet.liquidCode) {
      snippetLiquidCode = render.snippet.liquidCode
    } else {
      snippetLiquidCode = await FileUtils.getMergedFilesContent(render.snippet.files.liquidFiles)
    }

    // Process "With" clause variable
    if (render.hasWithClause() && render.clauseSourceVariable !== render.clauseTargetVariable) {
      snippetLiquidCode = `{% assign ${render.clauseTargetVariable} = ${render.clauseSourceVariable} %}\n${snippetLiquidCode}`
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
