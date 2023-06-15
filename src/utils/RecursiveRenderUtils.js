// External Library imports
import merge from 'deepmerge'
import { union } from 'lodash-es'
import { join } from 'path'
import SnippetBuilder from '../main/builders/SnippetBuilder.js'
import FileUtils from './FileUtils.js'

// Archie imports
import SectionSchema from '../main/models/SectionSchema.js'
import SectionSchemaUtils from './SectionSchemaUtils.js'

class RecursiveRenderUtils {
  /**
   * Recursively Build Snippets From (Section) Renders
   * @param {Render[]} renders
   * @param {Object} [snippetCache={}]
   */
  static async buildSnippets (renders, snippetCache = {}) {
    for (const render of renders) {
      if (!snippetCache[render.snippetName]) {
        snippetCache[render.snippetName] = await SnippetBuilder.build(render.snippet)
      }
      render.snippet = snippetCache[render.snippetName]
      // Recursively check child renders for schema
      if (render.snippet.renders?.length) {
        await this.buildSnippets(render.snippet.renders, snippetCache)
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
        if (render.snippet.files.assetFiles?.length) {
          assets = assets.concat(render.snippet.files.assetFiles)
        }

        if (render.snippet.renders?.length) {
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
          jsFiles.push(render.snippet.files.javascriptIndex)
        }

        if (render.snippet.renders?.length) {
          jsFiles = jsFiles.concat(this.getSnippetsJavascriptIndex(render.snippet.renders, processedSnippets))
        }
      }
      processedSnippets.push(render.snippetName)
    }

    return jsFiles
  }

  /**
   * Get Snippets' Liquid Files' Write Promises
   * @param {Render[]} renders
   * @param {string} targetFolder
   * @param {string[]} [processedSnippets=[]]
   * @return {{liquidFilesWritePromise: Promise<Awaited<unknown>[]>, processedSnippets: string[]}}
   */
  static getSnippetsLiquidFilesWritePromise (renders, targetFolder, processedSnippets = []) {
    const liquidFilesWritePromises = []

    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        liquidFilesWritePromises.push(FileUtils.writeFile(join(targetFolder, `${render.snippet.name}.liquid`), render.snippet.build.liquidCode))
      }

      // Recursively check child renders for liquid files
      if (render.snippet.renders?.length) {
        const { liquidFilesWritePromise: childRendersLiquidWritePromises } = this.getSnippetsLiquidFilesWritePromise(render.snippet.renders, targetFolder, processedSnippets)
        liquidFilesWritePromises.push(childRendersLiquidWritePromises)
      }
    }

    return { liquidFilesWritePromise: Promise.all(liquidFilesWritePromises), processedSnippets }
  }

  /**
   * Get Main Stylesheets From Renders Recursively
   * @param {Render[]} renders
   * @param {string[]} [processedSnippets=[]]
   * @return {string[]}
   */
  static getSnippetsMainStylesheet (renders, processedSnippets = []) {
    const stylesheets = []
    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        if (render.snippet.files.mainStylesheet) {
          stylesheets.push(render.snippet.files.mainStylesheet)

          if (render.snippet.renders?.length) {
            stylesheets.push(...this.getSnippetsMainStylesheet(render.snippet.renders, processedSnippets))
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
        if (render.snippet.renders?.length) {
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
   * @param {string[]} [processedSnippets=[]]
   * @return {Object}
   */
  static getSnippetsSchema (renders, processedSnippets = []) {
    let schema = new SectionSchema()

    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        // Merge Snippet schema
        if (render.snippet.schema) {
          schema = SectionSchemaUtils.merge(schema, render.snippet.schema)
        }

        // Recursively check child renders for schema
        if (render.snippet.renders?.length) {
          schema = SectionSchemaUtils.merge(schema, this.getSnippetsSchema(render.snippet.renders, processedSnippets))
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
   * @return {Object}
   */
  static getSnippetsSchemaLocales (renders, processedSnippets = []) {
    let schemaLocales = {}

    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        if (render.snippet.schemaLocales) {
          schemaLocales = merge(schemaLocales, render.snippet.schemaLocales)
        }

        // Recursively merge child Schema Locales
        if (render.snippet.renders?.length) {
          schemaLocales = merge(schemaLocales, this.getSnippetsSchemaLocales(render.snippet.renders, processedSnippets))
        }

        processedSnippets.push(render.snippetName)
      }
    }

    return schemaLocales
  }

  /**
   * Get Snippet Schema Recursively
   * @param {Render[]} renders
   * @param {string[]} [processedSnippets=[]]
   * @return {Object[]}
   */
  static getSnippetsSettingsSchema (renders, processedSnippets = []) {
    let settingsSchema = []

    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        // Merge Snippet schema
        if (render.snippet.settingsSchema) {
          settingsSchema = merge(settingsSchema, render.snippet.settingsSchema)
        }

        // Recursively check child renders for schema
        if (render.snippet.renders?.length) {
          settingsSchema = merge(settingsSchema, this.getSnippetsSettingsSchema(render.snippet.renders, processedSnippets))
        }

        processedSnippets.push(render.snippetName)
      }
    }

    return settingsSchema
  }
}

export default RecursiveRenderUtils
