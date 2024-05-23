// Internal Dependencies
import ComponentFiles from '../models/ComponentFiles.js'
import { indexFiles } from '../utils/ComponentFilesUtils.js'
import { getFileContents } from '../utils/FileUtils.js'
import { getSnippetNames } from '../utils/LiquidUtils.js'
import { warn } from '../utils/LoggerUtils.js'
import Component from '../models/Component.js'

/**
 * Component Factory
 * @param {string} componentName
 * @param {string} componentFolder
 * @return {Promise<Component>}
 */
export async function componentFactory(componentName, componentFolder) {
  const component = new Component()
  component.name = componentName
  component.rootFolder = componentFolder
  // Index Snippet Files
  component.files = await indexFiles(component.name, component.rootFolder, new ComponentFiles())

  // Load Liquid Code
  component.liquidCode = await getFileContents(component.files.liquidFile)

  // Find snippet names in render tags
  component.snippetNames = getSnippetNames(component.liquidCode)

  // Warn When A Possible Recursive Render Call Is Made
  if (component.snippetNames.includes(component.name)) {
    warn(`The "${component.name}" component is trying to render itself, which could lead to a recursive infinite loop.`)
  }

  return component
}
