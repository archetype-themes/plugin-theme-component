import { basename, dirname, extname } from 'path'
import logger from './Logger.js'
import FileUtils from './FileUtils.js'
import Section from '../models/Section.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import SectionFiles from '../models/SectionFiles.js'
import StylesProcessor from '../processors/StylesProcessor.js'

class ComponentUtils {
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
          if (componentFiles instanceof Section && basename(file) === 'schema.json')
            componentFiles.schemaFile = file
          else if (basename(file).match(/^([a-z]{2})(-[a-z]{2})?(\.(default|schema)){0,2}\.json$/i))
            componentFiles.localeFiles.push(file)
          break
        default:
          logger.debug(`Ignoring ${FileUtils.convertToComponentRelativePath(file)}`)
          break
      }
    }

    if (componentFiles.javascriptFiles) {
      componentFiles.javascriptIndex = JavaScriptProcessor.getMainJavascriptFile(componentFiles.javascriptFiles)
    }

    if (componentFiles.stylesheets) {
      componentFiles.mainStylesheet = StylesProcessor.getMainStyleSheet(componentFiles.stylesheets)
    }

  }
}

export default ComponentUtils
