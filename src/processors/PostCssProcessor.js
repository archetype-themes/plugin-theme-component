import postcss from 'postcss' // PostCSS is a tool for transforming styles with JS plugins.

class PostCssProcessor {
  /**
   * Process Styles with PostCSS and its plugins
   * @param {string} styles
   * @param {string} sourceFile
   * @param {string} targetFile
   * @param {Object} postCssConfig
   * @return {Promise<string>}
   */
  static async processStyles (styles, sourceFile, targetFile, postCssConfig) {
    const processor = postcss(postCssConfig.plugins)
    const postCssOptions = {
      from: sourceFile,
      to: targetFile
    }
    // Reference: https://postcss.org/api/#processoptions
    const additionalProcessOptions = ['map', 'parser', 'stringifier', 'syntax']

    for (const option of additionalProcessOptions) {
      if (postCssConfig[option]) {
        postCssOptions[option] = postCssConfig[option]
      }
    }

    const result = await processor.process(styles, postCssOptions)

    return result.css
  }
}

export default PostCssProcessor
