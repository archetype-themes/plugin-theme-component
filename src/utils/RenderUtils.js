// External Librairy imports
import merge from 'deepmerge'
import { union } from 'lodash-es'

// Archie imports
import NodeUtils from './NodeUtils.js'
import SnippetBuilder from '../builders/SnippetBuilder.js'
import StylesUtils from './StylesUtils.js'

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
          const mainCssFile = StylesUtils.getComponentMainCssFile(render.snippet)
          if (mainCssFile) {
            stylesheets.push(mainCssFile)
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
   * Get Snippet Root Folders From Section/Snippet Renders
   * @param {Render[]} renders
   * @return {string[]}
   */
  static getSnippetRootFolders (renders) {
    let snippetRootFolders = []
    for (const render of renders) {
      if (render.snippet) {
        if (render.snippet.rootFolder && !snippetRootFolders.includes(render.snippet.rootFolder)) {
          snippetRootFolders.push(render.snippet.rootFolder)
        }
        if (render.snippet.renders && render.snippet.renders.length > 0) {
          const childSnippetRootFolders = this.getSnippetRootFolders(render.snippet.renders)
          snippetRootFolders = union(snippetRootFolders, childSnippetRootFolders)
        }
      }
    }
    return snippetRootFolders
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

}

export default RenderUtils
