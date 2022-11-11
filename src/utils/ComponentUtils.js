// NodeJS Imports
import path from 'path'
import { env } from 'node:process'
import { mkdir } from 'node:fs/promises'

// External Modules imports
import merge from 'deepmerge'

// Internal Modules
import FileUtils from './FileUtils.js'
import logger from './Logger.js'
import ArchieCLI from '../cli/models/ArchieCLI.js'
import ArchieNodeConfig from '../cli/models/ArchieNodeConfig.js'
import Collection from '../models/Collection.js'
import Section from '../models/Section.js'
import Snippet from '../models/Snippet.js'

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
   * Detects the package Folder Name
   * @param {Section|Snippet} component
   * @returns {string}
   */
  static getRootFolder (component) {
    if (ArchieNodeConfig.isSection() || ArchieNodeConfig.isSnippet()) {

      if (env.npm_package_name && env.npm_package_name.includes(component.name)) {
        return path.dirname(env.npm_package_json)
      } else if (component instanceof Snippet) {
        return path.join(path.dirname(env.npm_package_json), '../../', Collection.SNIPPETS_SUB_FOLDER, component.name)
      }
    } else if (ArchieNodeConfig.isCollection()) {
      if (component instanceof Section) {
        return path.join(path.dirname(env.npm_package_json), Collection.SECTIONS_SUB_FOLDER, component.name)
      }
      if (component instanceof Snippet) {
        return path.join(path.dirname(env.npm_package_json), Collection.SNIPPETS_SUB_FOLDER, component.name)
      }
    } else if (ArchieNodeConfig.isTheme()) {
      if (component instanceof Section) {
        return path.join(path.dirname(env.npm_package_json), 'node_modules', ArchieNodeConfig.DEFAULT_PACKAGE_SCOPE, ArchieCLI.targetComponentName, Collection.SECTIONS_SUB_FOLDER, component.name)
      }
      if (component instanceof Snippet) {
        return path.join(path.dirname(env.npm_package_json), 'node_modules', ArchieNodeConfig.DEFAULT_PACKAGE_SCOPE, ArchieCLI.targetComponentName, Collection.SNIPPETS_SUB_FOLDER, component.name)

      }
    }

    throw new Error(`Unable to determine Component Root Folder for ${component.name}`)
  }

  /**
   * Filter Section/Snippet Files by Type
   * @param {string[]} files
   * @param {SectionFiles|SnippetFiles} componentFiles
   */
  static filterFiles (files, componentFiles) {
    // Categorize files for the build steps
    for (const file of files) {
      const extension = path.extname(file)

      switch (extension) {
        case '.css':
        case '.less':
        case '.sass':
        case '.scss':
          componentFiles.stylesheets.push(file)
          break
        case '.js':
        case '.mjs':
          componentFiles.javascriptFiles.push(file)
          break
        case '.liquid':
          if (path.dirname(file).endsWith('/snippets')) {
            componentFiles.snippetFiles.push(file)
          } else {
            componentFiles.liquidFiles.push(file)
          }

          break
        case '.json':
          const filename = path.basename(file).toLowerCase()
          if (filename === 'package.json') {
            componentFiles.packageJson = file
          } else if (filename === 'schema.json') {
            componentFiles.schemaFile = file
          } else if (
            filename.match(/^([a-z]{2})(-[a-z]{2})?(\.default)?\.json$/) ||
            filename.match(/^locales?\.json$/)) {
            componentFiles.localeFiles.push(file)
          } else if (
            filename.match(/^([a-z]{2})(-[a-z]{2})?(\.default)?\.schema\.json$/) ||
            filename.match(/^locales?\.schema\.json$/)) {
            componentFiles.schemaLocaleFiles.push(file)
          }

          break
        default:
          logger.debug(`Filter Files: Unrecognised JSON file; ignoring ${FileUtils.convertToComponentRelativePath(file)}`)
          break
      }
    }
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
    const snippetRootFolders = []
    for (const render of renders) {
      if (render.snippet && render.snippet.rootFolder && !snippetRootFolders.includes(render.snippet.rootFolder)) {
        snippetRootFolders.push(render.snippet.rootFolder)
      }
    }
    return snippetRootFolders
  }

  /**
   *
   * @param {Section|Snippet} component
   * @param {Snippet} snippet
   * @return {Promise<void>}
   */
  static mergeSnippetData (component, snippet) {

    // Merge snippet schema data into section
    if (snippet.schema && component.schema) {
      component.schema = merge(component.schema, snippet.schema)
    } else if (snippet.schema) {
      component.schema = snippet.schema
    }

    // Merge snippet locale data into section
    if (snippet.locales && component.locales) {
      component.locales = merge(component.locales, snippet.locales)
    } else if (snippet.locales) {
      component.locales = snippet.locales
    }
  }

}

export default ComponentUtils
