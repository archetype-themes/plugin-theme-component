// Internal Dependencies
import { componentFilesFactory } from './componentFilesFactory.js'
import { getFileContents } from '../utils/fileUtils.js'
import { getSnippetNames } from '../utils/liquidUtils.js'
import { warn } from '../utils/logger.js'
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
  component.files = await componentFilesFactory(component.name, component.rootFolder)

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
