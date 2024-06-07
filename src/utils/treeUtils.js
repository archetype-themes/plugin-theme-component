// Internal Dependencies
import FileMissingError from '../errors/FileMissingError.js'
import { fatal, info, logSpacer, logTitleItem, warn } from './logger.js'
import Session from '../models/static/Session.js'

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

/**
 * Attach Child Components
 * @param {Section[]|Component[]|Snippet[]} topElements
 * @param {(Component|Snippet)[]} availableComponents
 */
export async function setComponentHierarchy(topElements, availableComponents) {
  for (const topComponent of topElements) {
    if (!topComponent.snippets?.length && topComponent.snippetNames?.length) {
      for (const snippetName of topComponent.snippetNames) {
        const snippet = availableComponents.find((component) => component.name === snippetName)
        if (snippet !== undefined) {
          topComponent.snippets.push(snippet)
        } else {
          const message = `Unable to find component "${snippetName}" requested from a render tag in "${topComponent.name}".`
          if (Session.isCollection()) {
            // When we are playing with a collection, an invalid component name should create a fatal error
            fatal(message)
          } else {
            // When we are playing with a theme,
            // an unknown component name could be a reference to a theme's internal snippets,
            // so a warning is enough
            warn(message)
            warn(
              `If "${snippetName}" is a custom theme snippet, this is expected behaviour. If not, check the components CHANGELOG.md for renamed/removed components.`
            )
          }
        }
      }
    }
  }
}

/**
 * Displays A Collection's Component Tree
 * @param {module:models/Collection} collection
 */
export function displayCollectionTree(collection) {
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
 * Displays A Theme's Component Tree
 * @param {Theme} theme
 */
export function displayThemeTree(theme) {
  logTitleItem('Theme Sections Tree')

  logSpacer()
  info(`${theme.name}/`)

  // Top level is section components only

  for (const [i, section] of theme.sections.entries()) {
    const last = i === theme.sections.length - 1
    folderTreeLog(section, last)
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
