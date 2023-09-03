// Node.js imports
import { join } from 'node:path'

// External imports
import merge from 'deepmerge'
import { union } from 'lodash-es'

// Internal imports
import FileUtils from './FileUtils.js'
import SectionSchema from '../main/models/SectionSchema.js'
import SectionSchemaUtils from './SectionSchemaUtils.js'
import SnippetBuilder from '../main/builders/SnippetBuilder.js'
import { mergeObjectArraysByUniqueKey } from './ArrayUtils.js'

class SnippetUtils {
  /**
   * Build Snippets Recursively
   * @param {Snippet[]} snippets
   */
  static async buildRecursively (snippets) {
    for (const snippet of snippets) {
      await SnippetBuilder.build(snippet)
      // Recursively check child snippets for schema
      if (snippet.snippets?.length) {
        await this.buildRecursively(snippet.snippets)
      }
    }
    return snippets
  }

  /**
   * Recursively Get Asset Files
   * @param {Snippet[]} snippets
   * @param {string[]} [processedSnippets=[]]
   * @return {string[]}
   */
  static getAssetsRecursively (snippets, processedSnippets = []) {
    let assets = []

    for (const snippet of snippets) {
      if (!processedSnippets.includes(snippet.name)) {
        if (snippet.files.assetFiles?.length) {
          assets = assets.concat(snippet.files.assetFiles)
        }

        if (snippet.snippets?.length) {
          assets = assets.concat(this.getAssetsRecursively(snippet.snippets, processedSnippets))
        }

        processedSnippets.push(snippet.name)
      }
    }

    return assets
  }

  /**
   * Recursively Get Javascript Indexes
   * @param {Snippet[]} snippets
   * @param {string[]} [processedSnippets=[]]
   * @return {string[]}
   */
  static getJavascriptIndexesRecursively (snippets, processedSnippets = []) {
    let jsFiles = []
    for (const snippet of snippets) {
      if (!processedSnippets.includes(snippet.name)) {
        if (snippet.files.javascriptIndex) {
          jsFiles.push(snippet.files.javascriptIndex)
        }

        if (snippet.snippets?.length) {
          jsFiles = jsFiles.concat(this.getJavascriptIndexesRecursively(snippet.snippets, processedSnippets))
        }
      }
      processedSnippets.push(snippet.name)
    }

    return jsFiles
  }

  /**
   * Recursively Get Liquid Files' Write Promises
   * @param {Snippet[]} snippets
   * @param {string} targetFolder
   * @param {string[]} [processedSnippets=[]]
   * @return {{liquidFilesWritePromise: Promise<Awaited<unknown>[]>, processedSnippets: string[]}}
   */
  static getLiquidFilesWritePromisesRecursively (snippets, targetFolder, processedSnippets = []) {
    const liquidFilesWritePromises = []

    for (const snippet of snippets) {
      if (!processedSnippets.includes(snippet.name)) {
        liquidFilesWritePromises.push(FileUtils.writeFile(join(targetFolder, `${snippet.name}.liquid`), snippet.build.liquidCode))
      }

      // Recursively check child snippets for liquid files
      if (snippet.snippets?.length) {
        const { liquidFilesWritePromise: childLiquidFilesWritePromises } = this.getLiquidFilesWritePromisesRecursively(snippet.snippets, targetFolder, processedSnippets)
        liquidFilesWritePromises.push(childLiquidFilesWritePromises)
      }
    }

    return { liquidFilesWritePromise: Promise.all(liquidFilesWritePromises), processedSnippets }
  }

  /**
   * Get Main Stylesheets Recursively
   * @param {Snippet[]} snippets
   * @param {string[]} [processedSnippets=[]]
   * @return {string[]}
   */
  static getMainStylesheetsRecursively (snippets, processedSnippets = []) {
    const stylesheets = []
    for (const snippet of snippets) {
      if (!processedSnippets.includes(snippet.name)) {
        if (snippet.files.mainStylesheet) {
          stylesheets.push(snippet.files.mainStylesheet)

          if (snippet.snippets?.length) {
            stylesheets.push(...this.getMainStylesheetsRecursively(snippet.snippets, processedSnippets))
          }
        }
        processedSnippets.push(snippet.name)
      }
    }
    return stylesheets
  }

  /**
   * Get All Snippet Root Folders Recursively
   * @param {Snippet[]} snippets
   * @return {string[]}
   */
  static getRootFoldersRecursively (snippets) {
    let snippetRootFolders = []
    for (const snippet of snippets) {
      if (snippet) {
        if (snippet.rootFolder && !snippetRootFolders.includes(snippet.rootFolder)) {
          snippetRootFolders.push(snippet.rootFolder)
        }
        if (snippet.snippets?.length) {
          const childSnippetRootFolders = this.getRootFoldersRecursively(snippet.snippets)
          snippetRootFolders = union(snippetRootFolders, childSnippetRootFolders)
        }
      }
    }
    return snippetRootFolders
  }

  /**
   * Build Section Schema Recursively
   * @param {Snippet[]} snippets
   * @param {string[]} [processedSnippets=[]]
   * @return {Object}
   */
  static buildSectionSchemaRecursively (snippets, processedSnippets = []) {
    let buildSchema = new SectionSchema()

    for (const snippet of snippets) {
      if (!processedSnippets.includes(snippet.name)) {
        // Merge Snippet schema
        if (snippet.build.schema) {
          buildSchema = SectionSchemaUtils.merge(buildSchema, snippet.build.schema)
        }

        // Recursively check child snippets for schema
        if (snippet.snippets?.length) {
          buildSchema = SectionSchemaUtils.merge(buildSchema, this.buildSectionSchemaRecursively(snippet.snippets, processedSnippets))
        }

        processedSnippets.push(snippet.name)
      }
    }

    return buildSchema
  }

  /**
   * Build Storefront Locales Or Schema Locales Recursively
   * @param {Snippet[]} snippets
   * @param {boolean} [isSchemaLocales=false]
   * @param {string[]} [processedSnippets=[]]
   * @return {Object}
   */
  static buildLocalesRecursively (snippets, isSchemaLocales = false, processedSnippets = []) {
    let buildLocales = {}
    const localesKey = isSchemaLocales ? 'schemaLocales' : 'locales'

    for (const snippet of snippets) {
      if (!processedSnippets.includes(snippet.name)) {
        if (snippet.build[localesKey]) {
          buildLocales = merge(buildLocales, snippet.build[localesKey])
        }

        // Recursively merge child Schema Locales
        if (snippet.snippets?.length) {
          buildLocales = merge(buildLocales, this.buildLocalesRecursively(snippet.snippets, isSchemaLocales, processedSnippets))
        }

        processedSnippets.push(snippet.name)
      }
    }

    return buildLocales
  }

  /**
   * Build Settings Schema Recursively
   * @param {Snippet[]} snippets
   * @param {string[]} [processedSnippets=[]]
   * @return {Object[]|null}
   */
  static buildSettingsSchemaRecursively (snippets, processedSnippets = []) {
    let settingsSchema = []

    for (const snippet of snippets) {
      if (!processedSnippets.includes(snippet.name)) {
        // Merge Snippet schema
        if (snippet.settingsSchema) {
          settingsSchema = mergeObjectArraysByUniqueKey(settingsSchema, snippet.settingsSchema)
        }

        // Recursively check child snippets for schema
        if (snippet.snippets?.length) {
          const childrenSettingsSchema = this.buildSettingsSchemaRecursively(snippet.snippets, processedSnippets)
          if (childrenSettingsSchema?.length) {
            settingsSchema = mergeObjectArraysByUniqueKey(settingsSchema, childrenSettingsSchema)
          }
        }

        processedSnippets.push(snippet.name)
      }
    }

    return settingsSchema.length ? settingsSchema : null
  }
}

export default SnippetUtils
