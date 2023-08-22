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
  static getSnippetsBuildSchema (renders, processedSnippets = []) {
    let buildSchema = new SectionSchema()

    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        // Merge Snippet schema
        if (render.snippet.build.schema) {
          buildSchema = SectionSchemaUtils.merge(buildSchema, render.snippet.build.schema)
        }

        // Recursively check child renders for schema
        if (render.snippet.renders?.length) {
          buildSchema = SectionSchemaUtils.merge(buildSchema, this.getSnippetsBuildSchema(render.snippet.renders, processedSnippets))
        }

        processedSnippets.push(render.snippetName)
      }
    }

    return buildSchema
  }

  /**
   * Get Schema Locales from Render Snippets Recursively
   * @param {Render[]} renders
   * @param {boolean} [schemaLocales=false]
   * @param {string[]} [processedSnippets=[]]
   * @return {Object}
   */
  static getSnippetsBuildLocales (renders, schemaLocales = false, processedSnippets = []) {
    let buildLocales = {}
    const localesKey = schemaLocales ? 'schemaLocales' : 'locales'

    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        if (render.snippet.build[localesKey]) {
          buildLocales = merge(buildLocales, render.snippet.build[localesKey])
        }

        // Recursively merge child Schema Locales
        if (render.snippet.renders?.length) {
          buildLocales = merge(buildLocales, this.getSnippetsBuildLocales(render.snippet.renders, schemaLocales, processedSnippets))
        }

        processedSnippets.push(render.snippetName)
      }
    }

    return buildLocales
  }

  /**
   * Get Snippet Schema Recursively
   * @param {Render[]} renders
   * @param {string[]} [processedSnippets=[]]
   * @return {Object[]}
   */
  static getSnippetsSettingsSchema (renders, processedSnippets = []) {
    const settingsSchema = []

    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        // Merge Snippet schema
        if (render.snippet.settingsSchema) {
          settingsSchema.push(...render.snippet.settingsSchema)
        }

        // Recursively check child renders for schema
        if (render.snippet.renders?.length) {
          settingsSchema.push(...this.getSnippetsSettingsSchema(render.snippet.renders, processedSnippets))
        }

        processedSnippets.push(render.snippetName)
      }
    }

    return settingsSchema
  }
}

export default RecursiveRenderUtils
