import cssnanoPlugin from 'cssnano'
import postcss from 'postcss'
import postcss_for from 'postcss-for'
import postcss_import from 'postcss-import'
import postcss_mixins from 'postcss-mixins'
import postcssPresetEnv from 'postcss-preset-env'
import postcss_scss from 'postcss-scss'
import postcss_shopify_settings_variables from 'postcss-shopify-settings-variables'
import postcss_simple_vars from 'postcss-simple-vars'
import tailwindcss from 'tailwindcss'

class PostCssProcessor {
  /**
   * Process Styles with PostCSS and its plugins
   * @param {string} styles
   * @param {string} sourceFile
   * @param {string} targetFile
   * @return {Promise<string>}
   */
  static async processStyles (styles, sourceFile, targetFile) {
    const processor = postcss([
      postcss_import,
      postcss_mixins,
      postcss_for,
      postcss_simple_vars,
      postcssPresetEnv({
        features: {
          'nesting-rules': true
        },
        stage: 1,
      }),
      postcss_shopify_settings_variables,
      tailwindcss({
        content: ['./**/*.{liquid,json}'],
        theme: {
          extend: {},
        },
        plugins: [],
      }),
      cssnanoPlugin({
        preset: ['default', {
          convertValues: false, // so liquid color filters work
          mergeLonghand: false,
          mergeRules: false,
          normalizeCharset: false,
          normalizeDisplayValues: false,
          normalizeWhitespace: false,
          rawCache: true,
        }]
      })
    ])

    const result = await processor.process(styles, {
      from: sourceFile,
      syntax: postcss_scss,
      to: targetFile,
    })

    return result.css
  }
}

export default PostCssProcessor
