import { constants } from 'node:fs'
import { access, mkdir } from 'node:fs/promises'
import { basename, dirname, extname } from 'node:path'
import { env } from 'node:process'
import FileUtils from './FileUtils.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import logger from './Logger.js'
import SectionFiles from '../models/SectionFiles.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import Section from '../models/Section.js'
import Snippet from '../models/Snippet.js'
import Config from '../Config.js'
import path from 'path'

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
      throw new Error(`${component}: Can't access component root folder at expected location "${componentFolder}" - Verify that the folder exists and has access execute permissions (ie: 755)`)
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
      } else if (component instanceof Snippet) {
        return path.join(dirname(env.npm_package_json), Config.COLLECTION_SNIPPETS_SUBFOLDER, component.name)
      }
    } else if (Config.isTheme()) {
      // TODO: FIX THAT componentFolder = `${dirname(env.npm_package_json)}/node_modules/@archetype-themes/${Config.collectionFolder}`
      throw new Error('Config.getRootFolder: NOT IMPLEMENTED YET FOR THEMES')
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
            filename.match(/^([a-z]{2})(-[a-z]{2})?(\.(default|schema)){0,2}\.json$/) ||
            filename.match(/^locales?\.json$/))
            componentFiles.localeFiles.push(file)
          break
        default:
          logger.debug(`Filter Files: Unrecognised JSON file; ignoring ${FileUtils.convertToComponentRelativePath(file)}`)
          break
      }
    }

    if (componentFiles.javascriptFiles.length > 0) {
      componentFiles.javascriptIndex = JavaScriptProcessor.getMainJavascriptFile(componentFiles.javascriptFiles)
    }

    if (componentFiles.stylesheets.length > 0) {
      componentFiles.mainStylesheet = StylesProcessor.getMainStyleSheet(componentFiles.stylesheets)
    }

  }

  /**
   * Parse Locale Files and store their contents in an associative array in the component
   * @param {string[]} localeFiles
   * @return {Promise<string[][]>}
   */
  static async parseLocaleFilesContent (localeFiles) {
    const locales = []
    for (const localeFile of localeFiles) {
      locales[basename(localeFile, '.json')] = JSON.parse(await FileUtils.getFileContents(localeFile))
    }

    return locales
  }
}

export default ComponentUtils
