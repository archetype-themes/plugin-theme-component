import merge from 'deepmerge'
import StylesUtils from './StylesUtils.js'
import NodeUtils from './NodeUtils.js'
import SnippetBuilder from '../builders/SnippetBuilder.js'

class RenderUtils {

  /**
   * Build Snippets Recursively
   * @param {Render[]} renders
   * @param {string[]} [processedSnippets=[]]
   */
  static async buildSnippets (renders, processedSnippets = []) {

    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        await SnippetBuilder.build(render.snippet)

        processedSnippets.push(render.snippetName)
      }

      if (render.snippet.renders) {
        await this.buildSnippets(render.snippet.renders, processedSnippets)
      }

    }
  }

  /**
   * Get Render Asset Files Recursively
   * @param {Render[]} renders
   * @param {string[]} [processedSnippets=[]]
   * @return {string[]}
   */
  static getSnippetAssets (renders, processedSnippets = []) {
    let assets = []

    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        if (render.snippet.files.assetFiles && render.snippet.files.assetFiles.length > 0) {
          assets = assets.concat(render.snippet.files.assetFiles)
        }

        if (render.snippet.renders) {
          assets = assets.concat(this.getSnippetAssets(render.snippet.renders, processedSnippets))
        }

        processedSnippets.push(render.snippetName)
      }
    }

    return assets
  }

  /**
   * Get Javascript Indexes from Renders Recursively
   * @param {Render[]} renders
   * @param {string[]} [processedSnippets=[]]
   * @return {string[]}
   */
  static getSnippetsJavascriptIndex (renders, processedSnippets = []) {
    let jsFiles = []
    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        if (render.snippet.files.javascriptIndex) {
          jsFiles.push(render.snippet.files.mainStylesheet)
        }

        if (render.snippet.renders) {
          jsFiles = jsFiles.concat(this.getSnippetsJavascriptIndex(render.snippet.renders, processedSnippets))
        }
      }
      processedSnippets.push(render.snippetName)
    }

    return jsFiles
  }

  /**
   * Get Schema Locales from Render Snippets Recursively
   * @param {Render[]} renders
   * @param {string[]} [processedSnippets=[]]
   * @return {Object[]}
   */
  static getSnippetsSchemaLocales (renders, processedSnippets) {
    let schemaLocales = []

    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {

        if (render.snippet.schemaLocales) {
          schemaLocales = NodeUtils.mergeObjectArrays(schemaLocales, render.snippet.schemaLocales)
        }

        // Recursively merge child Schema Locales
        if (render.snippet.renders) {
          schemaLocales =
            NodeUtils.mergeObjectArrays(schemaLocales, this.getSnippetsSchemaLocales(render.snippet.renders, processedSnippets))
        }

        processedSnippets.push(render.snippetName)
      }
    }
    return schemaLocales
  }

  /**
   * Get Main Stylesheets From Renders Recursively
   * @param {Render[]} renders
   * @param {string[]} [processedSnippets=[]]
   * @return {string[]}
   */
  static getSnippetsMainStylesheet (renders, processedSnippets = []) {

    let stylesheets = []
    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        if (render.snippet.files.mainStylesheet) {
          if (StylesUtils.isSassFile(render.snippet.files.mainStylesheet)) {
            stylesheets.push(render.snippet.build.stylesheet)
          } else {
            stylesheets.push(render.snippet.files.mainStylesheet)
          }

          if (render.snippet.renders) {
            stylesheets = stylesheets.concat(this.getSnippetsMainStylesheet(render.snippet.renders, processedSnippets))
          }
        }
        processedSnippets.push(render.snippetName)
      }
    }
    return stylesheets
  }

  /**
   * Get Snippet Schema Recursively
   * @param {Render[]} renders
   * @param {string[]} [processedSnippets]
   * @return {Object}
   */
  static getSnippetsSchema (renders, processedSnippets = []) {
    let schema = {}

    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        // Merge Snippet schema
        if (render.snippet.schema) {
          schema = merge(schema, render.snippet.schema)
        }

        // Recursively check child renders for schema
        if (render.snippet.renders) {
          schema = merge(schema, this.getSnippetsSchema(render.snippet.renders, processedSnippets))
        }

        processedSnippets.push(render.snippetName)
      }
    }
    return schema
  }

}

export default RenderUtils