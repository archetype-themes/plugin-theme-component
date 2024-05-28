// Internal Imports
import postcss from 'postcss'
import postcssImport from 'postcss-import'
import postcssPresetEnv from 'postcss-preset-env'
import browsers from '@shopify/browserslist-config'

class StylesProcessor {
  /**
   * Create Styles Bundle
   * @param {string[]} stylesheets
   * @return {Promise<string>}
   */
  static async buildStylesBundle(stylesheets) {
    const mainStylesheet = this.createMainStylesheet(stylesheets)

    return this.processStyles(mainStylesheet)
  }

  /**
   * Process Styles with PostCSS and its plugins
   * @param {string} styles
   * @return {Promise<string>}
   */
  static async processStyles(styles) {
    const processor = postcss([
      postcssImport(),
      postcssPresetEnv({
        stage: 2,
        browsers,
        features: {
          'nesting-rules': true
        }
      })
    ])

    const result = await processor.process(styles, { map: false })

    return result.css
  }

  /**
   * Create Main Stylesheet
   * @param stylesheets
   * @return {string}
   */
  static createMainStylesheet(stylesheets) {
    let masterStylesheetContents = ''
    const processedStylesheets = []

    for (const stylesheet of stylesheets) {
      // When building a Collection, multiple Components might include the same snippet;
      // Therefore, we check for duplicates
      if (!processedStylesheets.includes(stylesheet)) {
        masterStylesheetContents += `@import '${stylesheet}';\n`
        processedStylesheets.push(stylesheet)
      }
    }

    return masterStylesheetContents
  }
}

export default StylesProcessor
