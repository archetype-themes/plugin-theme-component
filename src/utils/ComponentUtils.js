// NodeJS Imports
import path from 'path'
import { mkdir } from 'node:fs/promises'

// External Modules imports
import merge from 'deepmerge'
import { union } from 'lodash-es'

// Internal Modules
import FileUtils from './FileUtils.js'

class ComponentUtils {

  /**
   *
   * @param {Section|Snippet} component
   * @return {Promise<void>}
   */
  static async createFolderStructure (component) {
    await mkdir(`${component.rootFolder}/src/locales`, { recursive: true })
    await mkdir(`${component.rootFolder}/src/scripts`, { recursive: true })
    await mkdir(`${component.rootFolder}/src/styles`, { recursive: true })
    await mkdir(`${component.rootFolder}/src/snippets`, { recursive: true })
  }

  /**
   * Parse Locale Files into an object
   * @param {string[]} localeFiles
   * @return {Promise<string[]|Object>}
   */
  static async parseLocaleFilesContent (localeFiles) {
    let locales
    if (localeFiles.length > 0) {
      if (localeFiles[0].endsWith('.schema.json')) {
        locales = []
      } else {
        locales = {}
      }
    }

    const singleLocaleFileRegex = /^(?<locale>([a-z]{2})(-[a-z]{2}))?(\.default)?(\.schema)?\.json$/

    for (const localeFileWithPath of localeFiles) {
      const localeFileName = path.basename(localeFileWithPath).toLowerCase()

      const singleLocaleMatch = localeFileName.match(singleLocaleFileRegex)

      // We have a single locale in a distinctly named file
      if (singleLocaleMatch) {
        // Get locale from filename
        const locale = singleLocaleMatch.groups.locale

        // Merge with matching locale
        const localeData = JSON.parse(await FileUtils.getFileContents(localeFileWithPath))

        if (locales[locale]) {
          locales[locale] = merge(locales[locale], localeData)
        } else {
          locales[locale] = localeData
        }

      }
      // We have a single file with multiple locales
      else if (localeFileName.match(/^locales?(\.schema)?\.json$/)) {
        // Load locales.json file
        const localesData = JSON.parse(await FileUtils.getFileContents(localeFileWithPath))

        // merge locales
        locales = merge(locales, localesData)
      }
    }

    return locales
  }

  /**
   * Get Snippet Root Folders From Section/Snippet Renders
   * @param {Render[]} renders
   * @return {string[]}
   */
  static getSnippetRootFoldersFromRenders (renders) {
    let snippetRootFolders = []
    for (const render of renders) {
      if (render.snippet) {
        if (render.snippet.rootFolder && !snippetRootFolders.includes(render.snippet.rootFolder)) {
          snippetRootFolders.push(render.snippet.rootFolder)
        }
        if (render.snippet.renders && render.snippet.renders.length > 0) {
          const childSnippetRootFolders = this.getSnippetRootFoldersFromRenders(render.snippet.renders)
          snippetRootFolders = union(snippetRootFolders, childSnippetRootFolders)
        }
      }
    }
    return snippetRootFolders
  }

}

export default ComponentUtils
