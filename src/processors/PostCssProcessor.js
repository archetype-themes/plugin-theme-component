import cssnanoPlugin from 'cssnano' // A modular minifier, built on top of the PostCSS ecosystem.
import customMixins from './postcss/custom-mixins.js' // Custom PostCSS Mixins
import postcss from 'postcss' // PostCSS is a tool for transforming styles with JS plugins.
import postcssFor from 'postcss-for' // PostCSS plugin to transform @for at-rules to CSS.
import postcssImport from 'postcss-import' // PostCSS plugin to inline @import rules content.
import postcssMixins from 'postcss-mixins' // PostCSS plugin for mixins. -- Note, that you must set this plugin before postcss-simple-vars and postcss-nested.
import postcssPresetEnv from 'postcss-preset-env' // Convert modern CSS into something most browsers can understand
import postcssSass from '@csstools/postcss-sass' // PostCSS plugin to transform Sass-like @at-rules to CSS.
import postcssScss from 'postcss-scss' // PostCSS plugin to transform SCSS-like @at-rules to CSS.
import postcssShopifySettingsVariables from 'postcss-shopify-settings-variables' // PostCSS plugin to allow use of Shopify specific theme variables in Shopify css files.
import postcssSimpleVars from 'postcss-simple-vars' // PostCSS plugin for Sass-like variables.
import tailwindcss from 'tailwindcss' // A utility-first CSS framework for rapid UI development.

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
