import postcss from 'postcss' // PostCSS is a tool for transforming styles with JS plugins.
import postcssrc from 'postcss-load-config'

class PostCssProcessor {
  /**
   * Process Styles with PostCSS and its plugins
   * @param {string} styles
   * @param {string} sourceFile
   * @param {string} targetFile
   * @param {string} contextPath
   * @return {Promise<string>}
   */
  static async processStyles (styles, sourceFile, targetFile, contextPath) {
    const { plugins, options } = await postcssrc({ cwd: contextPath }, contextPath)
    const processor = postcss(plugins)

    options.from = sourceFile
    options.to = targetFile

    const result = await processor.process(styles, options)

    return result.css
  }
}

export default PostCssProcessor
