// External Dependencies
import { ux } from '@oclif/core'

// Internal Dependencies
import ComponentFiles from '../models/ComponentFiles.js'
import ComponentFilesUtils from '../utils/ComponentFilesUtils.js'
import { getFileContents } from '../utils/FileUtils.js'
import { getSnippetNames } from '../utils/LiquidUtils.js'

class ComponentFactory {
  /**
   * Initialize Component
   * @param {Component|Snippet} component
   * @returns {Promise<Component|Snippet>}
   */
  static async initializeComponent(component) {
    // Index Snippet Files
    component.files = await ComponentFilesUtils.indexFiles(component.name, component.rootFolder, new ComponentFiles())

    // Load Liquid Code
    component.liquidCode = await getFileContents(component.files.liquidFile)

    // Find snippet names in render tags
    component.snippetNames = getSnippetNames(component.liquidCode)

    // Warn When A Possible Recursive Render Call Is Made
    if (component.snippetNames.includes(component.name)) {
      ux.warn(
        `The "${component.name}" component is trying to render itself, which could lead to a recursive infinite loop.`
      )
    }

    return component
  }
}

export default ComponentFactory
