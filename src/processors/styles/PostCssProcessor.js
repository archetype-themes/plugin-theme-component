import browsers from '@shopify/browserslist-config' // A list of browsers that we support
import postcss from 'postcss' // PostCSS is a tool for transforming styles with JS plugins.
import postcssImport from 'postcss-import' // Resolve @import statements in CSS
import postcssPresetEnv from 'postcss-preset-env' // Convert modern CSS into something most browsers can understand

class PostCssProcessor {
  /**
   * Process Styles with PostCSS and its plugins
   * @param {string} styles
   * @param {string} sourceFile
   * @param {string} targetFile
   * @return {Promise<string>}
   */
  static async processStyles(styles, sourceFile, targetFile) {
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

    const result = await processor.process(styles, {
      from: sourceFile,
      to: targetFile,
      map: false
    })

    return result.css
  }
}

export default PostCssProcessor
