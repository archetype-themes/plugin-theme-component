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
}

export default LiquidUtils
