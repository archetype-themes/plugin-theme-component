const LIQUID_COMMENTS_REGEX = /\{%-?\s*comment\s*-?%}[\s\S]*?\{%-?\s*endcomment\s*-?%}/gi

class LiquidUtils {
  /**
   * Finds snippet names from render tags in liquid code
   * @param {string} liquidCode
   * @returns {string[]}
   */
  static getSnippetNames (liquidCode) {
    const cleanLiquidCode = LiquidUtils.stripComments(liquidCode)
    console.log(cleanLiquidCode)
    const blockRegex = /\{%-?.*?-?%}/sg
    const renderRegex = /\srender\s+'([^']+)'/sg

    const snippetNames = new Set()
    for (const block of cleanLiquidCode.matchAll(blockRegex)) {
      for (const renderMatch of block[0].matchAll(renderRegex)) {
        snippetNames.add(renderMatch[1])
      }
    }

    return [...snippetNames]
  }

  static stripComments (liquidCode) {
    return liquidCode.replace(LIQUID_COMMENTS_REGEX, '')
  }
}

export default LiquidUtils
