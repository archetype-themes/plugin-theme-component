// Internal Dependencies
import FileMissingError from '../errors/FileMissingError.js'
import ComponentFactory from '../factory/ComponentFactory.js'
import Snippet from '../models/Snippet.js'
import { dirname, parse } from 'node:path'

/**
 *
 * @param {(Component|Snippet)[]} components
 * @param {string[]} componentNames
 * @returns {Set<string>}
 */
export function validateComponentNames(components, componentNames) {
  let componentsNameTree = new Set(componentNames)

  componentNames.forEach((componentName) => {
    // Find its matching component object
    const component = components.find((component) => component.name === componentName)

    if (!component) {
      throw new FileMissingError(`Unable to find the component "${componentName}".`)
    }

    // Recursive call applied to snippet names
    const componentNameTree = validateComponentNames(components, component.snippetNames)
    // Merge data with the global Set
    componentsNameTree = new Set([...componentsNameTree, ...componentNameTree])
  })

  return componentsNameTree
}

/**
 * Build a Collection
 * @param {Component[]} components Components
 * @throws InternalError - No components found
 * @return {Promise<Component[]>} Loaded snippets
 */
export async function loadComponents(components) {
  // Initialize Individual Components
  return await Promise.all(components.map((component) => ComponentFactory.initializeComponent(component)))
}

export async function loadSnippets(components) {
  // Create Embedded Snippets Skeleton from Components
  const snippets = createEmbeddedSnippets(components)
  // Initialize Embedded Snippets
  return await Promise.all(snippets.map((snippet) => ComponentFactory.initializeComponent(snippet)))
}

/**
 * Create Embedded Snippets
 * @param {Component[]} components
 * @returns {Snippet[]}
 */
function createEmbeddedSnippets(components) {
  const componentsWithSnippet = components.filter((component) => component.files?.snippetFiles)

  return componentsWithSnippet
    .map((component) =>
      component.files.snippetFiles.map((snippetFile) => new Snippet(parse(snippetFile).name, dirname(snippetFile)))
    )
    .flat()
}
