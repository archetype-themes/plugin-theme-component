import ComponentFiles from '../models/ComponentFiles.js'
import ComponentFilesUtils from '../utils/ComponentFilesUtils.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import logger from '../utils/Logger.js'

class ComponentFactory {
  /**
   * Initialize Component
   * @param {Component|Snippet} component
   * @returns {Promise<Component|Snippet>}
   */
  static async initializeComponent (component) {
    // Index Snippet Files
    component.files = await ComponentFilesUtils.indexFiles(component.name, component.rootFolder, new ComponentFiles())

    // Load Liquid Code
    component.liquidCode = await FileUtils.getFileContents(component.files.liquidFile)

    // Find snippet names in render tags
    try {
      component.snippetNames = LiquidUtils.getSnippetNames(component.liquidCode)
    } catch (error) {
      LiquidUtils.handleLiquidParsingError(error, component.files.liquidFile)
    }
    // Warn When A Possible Recursive Render Call Is Made
    if (component.snippetNames.includes(component.name)) {
      logger.warn(`The "${component.name}" component is trying to render itself, which could lead to a recursive infinite loop.`)
    }

    return component
  }
}

export default ComponentFactory
