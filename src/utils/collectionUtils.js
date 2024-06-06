// Internal Dependencies
import FileMissingError from '../errors/FileMissingError.js'
import { info, logSpacer, logTitleItem } from './logger.js'

/**
 * Validate Component Names
 * @param {(Component|Snippet)[]} components
 * @param {string[]} componentNames
 * @returns {Set<string>}
 */
export function getComponentHierarchyNames(components, componentNames) {
  let componentHierarchyNames = new Set(componentNames)

  componentNames.forEach((componentName) => {
    // Find its matching component object
    const component = components.find((component) => component.name === componentName)

    if (!component) {
      throw new FileMissingError(`Unable to find the component "${componentName}".`)
    }

    // Recursive call applied to snippet names
    const childComponentHierarchyNames = getComponentHierarchyNames(components, component.snippetNames)
    // Merge data with the global Set
    componentHierarchyNames = new Set([...componentHierarchyNames, ...childComponentHierarchyNames])
  })

  return componentHierarchyNames
}

export function displayComponentTree(collection) {
  logTitleItem('Components Tree')

  logSpacer()
  info(`${collection.name}/`)

  // Top level is section components only
  let sectionComponents = collection.components.filter((component) => component.name.startsWith('section'))
  if (!sectionComponents.length > 0) {
    sectionComponents = collection.components
  }

  for (const [i, component] of sectionComponents.entries()) {
    const last = i === sectionComponents.length - 1
    folderTreeLog(component, last)
  }
}

/**
 * Folder Tree Log
 * @param {Component|Snippet} component
 * @param {boolean} [last=false]
 * @param {Array} [grid=[true]]
 * @returns {void}
 */
function folderTreeLog(component, last = false, grid = []) {
  const ascii = last ? '└──' : '├──'

  let prefix = ''
  grid.forEach((gridItem) => {
    prefix += gridItem ? '│    ' : '     '
  })

  info(`${prefix}${ascii} ${component.name}`)

  // Removing icons from the list
  const filteredSnippets = component.snippets.filter((component) => !component.isSvg())
  if (filteredSnippets.length) {
    grid.push(!last)
    for (const [i, snippet] of filteredSnippets.entries()) {
      const lastChild = i === filteredSnippets.length - 1
      folderTreeLog(snippet, lastChild, grid)

      lastChild && grid.pop()
    }
  }
}
