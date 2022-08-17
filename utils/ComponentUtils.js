import { constants } from 'node:fs'
import { access } from 'node:fs/promises'
import { basename, dirname, extname } from 'node:path'
import { cwd, env } from 'node:process'
import FileUtils from './FileUtils.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import logger from './Logger.js'
import SectionFiles from '../models/SectionFiles.js'
import StylesProcessor from '../processors/StylesProcessor.js'

class ComponentUtils {

  /**
   * Detects the package Folder Name
   * @param {string} componentName
   * @returns {Promise<string>}
   */
  static async detectRootFolder (componentName) {
    let packageFolder
    if (env.npm_config_local_prefix)
      packageFolder = env.npm_config_local_prefix
    else {
      packageFolder = cwd()

      if (packageFolder.includes(componentName)) {
        packageFolder = packageFolder.substring(0, packageFolder.lastIndexOf(componentName) + componentName.length)
      } else {
        packageFolder = `${dirname(cwd())}/${componentName}`
      }
    }

    try {
      await access(packageFolder, constants.X_OK)
    } catch (error) {
      throw new Error(`${componentName}: Can't access root folder at "${packageFolder}"`)
    }

    return packageFolder
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
            componentFiles.snippetFiles[basename(file, '.liquidFiles')] = file
          } else {
            componentFiles.liquidFiles.push(file)
          }

          break
        case '.json':
          if (basename(file).toLowerCase() === 'schema.json')
            componentFiles.schemaFile = file
          else if (basename(file).match(/^([a-z]{2})(-[a-z]{2})?(\.(default|schema)){0,2}\.json$/i))
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
