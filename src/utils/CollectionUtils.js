// External Dependencies
import { join } from 'node:path'

// Internal Dependencies
import { exists, getFolders } from './FileUtils.js'
import { COMPONENTS_FOLDER } from '../config/Components.js'
import FileMissingError from '../errors/FileMissingError.js'
import Component from '../models/Component.js'

/**
 * Find Components From package.json files
 * @param {string[]} componentFolders
 * @returns {Component[]}
 */
function findComponents(componentFolders) {
  const components = []

  for (const componentFolder of componentFolders) {
    const componentName = componentFolder.split('/').pop()
    components.push(new Component(componentName, componentFolder))
  }

  return components
}

/**
 * Get Collection's Component Folders
 * @param {string} collectionRootFolder
 * @returns {Promise<string[]>}
 */
async function getComponentFolders(collectionRootFolder) {
  const componentsFolder = join(collectionRootFolder, COMPONENTS_FOLDER)
  if (!(await exists(componentsFolder))) {
    throw new FileMissingError(`Unable to locate components folder ${componentsFolder}`)
  }
  return getFolders(join(collectionRootFolder, COMPONENTS_FOLDER))
}

/**
 *
 * @param {(Component|Snippet)[]} components
 * @param {string[]} componentNames
 * @returns {Set<string>}
 */
export function getComponentNamesToBuild(components, componentNames) {
  let componentsNameTree = new Set(componentNames)

  componentNames.forEach((componentName) => {
    // Find its matching component object
    const component = components.find((component) => component.name === componentName)

    if (!component) {
      throw new FileMissingError(`Unable to find the component "${componentName}".`)
    }

    // Recursive call applied to snippet names
    const componentNameTree = this.getComponentNamesToBuild(components, component.snippetNames)
    // Merge data with the global Set
    componentsNameTree = new Set([...componentsNameTree, ...componentNameTree])
  })

  return componentsNameTree
}

/**
 * Init Collection Components
 * @param {module:models/Collection} collection
 * @return {Promise<module:models/Collection>}
 */
export async function initComponents(collection) {
  // Find .gitignore File
  const gitignoreFile = join(collection.rootFolder, '.gitignore')
  if (await exists(gitignoreFile)) {
    collection.gitIgnoreFile = gitignoreFile
  }

  // Find All component Folders
  const componentFolders = await getComponentFolders(collection.rootFolder)

  // Create Components From components Folders
  collection.components = findComponents(componentFolders)

  return Promise.resolve(collection)
}
