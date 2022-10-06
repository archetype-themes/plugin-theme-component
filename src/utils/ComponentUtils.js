import { constants } from 'node:fs'
import { access, mkdir } from 'node:fs/promises'
import { basename, dirname, extname } from 'node:path'
import { env } from 'node:process'
import FileUtils from './FileUtils.js'
import logger from './Logger.js'
import SectionFiles from '../models/SectionFiles.js'
import Section from '../models/Section.js'
import Snippet from '../models/Snippet.js'
import Config from '../models/static/Config.js'
import path from 'path'
import merge from 'deepmerge'
import Archie from '../models/static/Archie.js'

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
   * @returns {Promise<string>}
   */
  static async getValidRootFolder (component) {

    let componentFolder = this.getRootFolder(component)

    try {
      await access(componentFolder, constants.X_OK)
    } catch (error) {
      throw new Error(`"${component.name}" not found at "${componentFolder}".\n\tVerify that the folder exists and its permissions.`)
    }

    return componentFolder
  }

  /**
   * Detects the package Folder Name
   * @param {Section|Snippet} component
   * @returns {string}
   */
  static getRootFolder (component) {
    if (Config.isSection() || Config.isSnippet()) {

      if (env.npm_package_name && env.npm_package_name.includes(component.name)) {
        return dirname(env.npm_package_json)
      }
    } else if (Config.isCollection()) {
      if (component instanceof Section) {
        return path.join(dirname(env.npm_package_json), Config.COLLECTION_SECTIONS_SUBFOLDER, component.name)
      }
      if (component instanceof Snippet) {
        return path.join(dirname(env.npm_package_json), Config.COLLECTION_SNIPPETS_SUBFOLDER, component.name)
      }
    } else if (Config.isTheme()) {
      if (component instanceof Section) {
        return path.join(dirname(env.npm_package_json), 'node_modules', Config.PACKAGES_SCOPE, Archie.targetComponent, Config.COLLECTION_SECTIONS_SUBFOLDER, component.name)
      }
      if (component instanceof Snippet) {
        return path.join(dirname(env.npm_package_json), 'node_modules', Config.PACKAGES_SCOPE, Archie.targetComponent, Config.COLLECTION_SNIPPETS_SUBFOLDER, component.name)

      }
    }

    throw new Error(`Unable to determine Component Root Folder for ${component.name}`)
  }

  /**
   *
   * @param {string[]} files
   * @param {SectionFiles|SnippetFiles} componentFiles
   */
  static filterFiles (files, componentFiles) {
    // Categorize files for the build steps
    for (const file of files) {
      const extension = extname(file)

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
          if (componentFiles instanceof SectionFiles && dirname(file).endsWith('/snippets')) {
            componentFiles.snippetFiles.push(file)
          } else {
            componentFiles.liquidFiles.push(file)
          }

          break
        case '.json':
          const filename = basename(file).toLowerCase()
          if (filename === 'schema.json')
            componentFiles.schemaFile = file
          else if (
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
   * @return {Promise<string[][]>}
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
      const localeFileName = basename(localeFileWithPath).toLowerCase()

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
}

export default ComponentUtils
