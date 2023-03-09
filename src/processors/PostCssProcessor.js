import cssnanoPlugin from 'cssnano'
import customMixins from './postcss/custom-mixins.js'
import postcss from 'postcss'
import postcssFor from 'postcss-for'
import postcssImport from 'postcss-import'
import postcssMixins from 'postcss-mixins'
import postcssPresetEnv from 'postcss-preset-env'
import postcssSass from '@csstools/postcss-sass'
import postcssScss from 'postcss-scss'
import postcssShopifySettingsVariables from 'postcss-shopify-settings-variables'
import postcssSimpleVars from 'postcss-simple-vars'
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
      postcssSass,
      postcssImport,
      postcssMixins({
        // PostCSS plugin for mixins. -- Note, that you must set this plugin before postcss-simple-vars and postcss-nested.
        mixins: customMixins
      }),
      postcssFor,
      postcssSimpleVars,
      postcssPresetEnv({
        features: {
          'nesting-rules': true
        },
        stage: 1
      }),
      postcssShopifySettingsVariables,
      tailwindcss({
        content: ['./**/*.{liquid,json}'],
        theme: {
          extend: {}
        },
        plugins: []
      }),
      cssnanoPlugin({
        preset: ['default', {
          convertValues: false, // so liquid color filters work
          mergeLonghand: false,
          mergeRules: false,
          normalizeCharset: false,
          normalizeDisplayValues: false,
          normalizeWhitespace: false,
          rawCache: true
        }]
      })
    ])

    const result = await processor.process(styles, {
      from: sourceFile,
      syntax: postcssScss,
      to: targetFile
    })

    return result.css
  }
}

export default PostCssProcessor
