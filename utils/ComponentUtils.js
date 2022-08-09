import { basename, dirname, extname } from 'path'
import logger from './Logger.js'
import FileUtils from './FileUtils.js'
import Section from '../models/Section.js'

class ComponentUtils {
  /**
   *
   * @param {string[]} files
   * @param {Section|Snippet} component
   */
  static filterFiles (files, component) {
    // Categorize files for the build steps
    for (const file of files) {
      const extension = extname(file)

      switch (extension) {
        case '.css':
        case '.less':
        case '.sass':
        case '.scss':
          component.styleSheets.push(file)
          break
        case '.js':
        case '.mjs':
          component.jsFiles.push(file)
          break
        case '.liquid':
          if (component instanceof Section && dirname(file).endsWith('/snippets')) {
            component.snippetFiles[basename(file, '.liquid')] = file
          } else {
            component.liquidFiles.push(file)
          }

          break
        case '.json':
          if (component instanceof Section && basename(file) === 'schema.json')
            component.schemaFile = file
          else if (basename(file).match(/^([a-z]{2})(-[a-z]{2})?(\.(default|schema)){0,2}\.json$/i))
            component.localeFiles.push(file)
          break
        default:
          logger.debug(`Ignoring ${FileUtils.convertToComponentRelativePath(file)}`)
          break
      }
    }
  }
}

export default ComponentUtils
