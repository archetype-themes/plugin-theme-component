// Node JS Internal imports
import path from 'path'

// Archie Internal JS imports
import SectionFiles from '../models/SectionFiles.js'
import SnippetFiles from '../models/SnippetFiles.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'
import StylesUtils from '../utils/StylesUtils.js'

class FilesFactory {
  /**
   * Generate SectionFiles object for a section, from its root folder
   * @param {string} folder
   * @returns {Promise<SectionFiles>}
   */
  static async fromSectionFolder (folder) {
    const files = await FileUtils.getFolderFilesRecursively(folder)
    const sectionFiles = new SectionFiles()
    this.#filterFiles(files, sectionFiles)

    if (sectionFiles.javascriptFiles.length > 0) {
      sectionFiles.javascriptIndex = JavaScriptProcessor.getMainJavascriptFile(sectionFiles.javascriptFiles)
    }

    if (sectionFiles.stylesheets.length > 0) {
      sectionFiles.mainStylesheet = StylesUtils.getMainStyleSheet(sectionFiles.stylesheets)
    }

    return sectionFiles
  }

  /**
   * Generate SnippetFiles object for a snippet, from its root folder
   * @param {string} folder
   * @returns {Promise<SnippetFiles>}
   */
  static async fromSnippetFolder (folder) {
    const files = await FileUtils.getFolderFilesRecursively(folder)
    const snippetFiles = new SnippetFiles()
    this.#filterFiles(files, snippetFiles)

    if (snippetFiles.javascriptFiles.length > 0) {
      snippetFiles.javascriptIndex = JavaScriptProcessor.getMainJavascriptFile(snippetFiles.javascriptFiles)
    }

    if (snippetFiles.stylesheets.length > 0) {
      snippetFiles.mainStylesheet = StylesUtils.getMainStyleSheet(snippetFiles.stylesheets)
    }

    return snippetFiles
  }

  /**
   * Filter Section/Snippet Files by Type
   * @param {string[]} files
   * @param {SectionFiles|SnippetFiles} componentFiles
   */
  static #filterFiles (files, componentFiles) {
    // Categorize files for the build steps
    for (const file of files) {
      const extension = path.extname(file).toLowerCase()
      const folder = path.dirname(file).toLowerCase()

      if (folder.endsWith('/assets')) {
        componentFiles.assetFiles.push(file)
      } else {

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
            if (folder.endsWith('/snippets')) {
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
            } else if (filename.match(/^([a-z]{2})(-[a-z]{2})?(\.default)?\.json$/) ||
              filename.match(/^locales?\.json$/)) {
              componentFiles.localeFiles.push(file)
            } else if (filename.match(/^([a-z]{2})(-[a-z]{2})?(\.default)?\.schema\.json$/) ||
              filename.match(/^locales?\.schema\.json$/)) {
              componentFiles.schemaLocaleFiles.push(file)
            }

            break
          default:
            logger.debug(`Filter Files: Unrecognised file; ignoring ${FileUtils.convertToComponentRelativePath(file)}`)
            break
        }
      }
    }
  }
}

export default FilesFactory
