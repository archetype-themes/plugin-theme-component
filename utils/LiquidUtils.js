import RenderFactory from '../factory/RenderFactory.js'

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
  
}

export default LiquidUtils