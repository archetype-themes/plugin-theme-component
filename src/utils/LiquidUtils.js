class LiquidUtils {
  /**
   * Finds snippet names from render tags in liquid code
   * @param {string} liquidCode
   * @returns {string[]}
   */
  static getSnippetNames (liquidCode) {
    const blockRegex = /\{%-?.*?-?%}/sg
    const renderRegex = /\srender\s+'([^']+)'/sg

    const snippetNames = []
    for (const block of liquidCode.matchAll(blockRegex)) {
      for (const renderMatch of block[0].matchAll(renderRegex)) {
        snippetNames.push(renderMatch[1])
      }
    }
    return snippetNames
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
