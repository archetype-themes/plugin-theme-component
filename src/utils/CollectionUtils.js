// Node.js imports
import { join } from 'node:path'

// Internal Imports
import { COLLECTIONS_INSTALL_FOLDER_NAME } from '../config/CLI.js'
import InternalError from '../errors/InternalError.js'
import Component from '../models/Component.js'
import Session from '../models/static/Session.js'

import { exists, getFolders } from './FileUtils.js'
import { isRepoUrl } from './WebUtils.js'
import FileMissingError from '../errors/FileMissingError.js'
import { COMPONENTS_FOLDER } from '../config/Components.js'

/**
 * Get Collection Root Folder
 * @param {string} [collectionName] - Required in a multiple Collection environment only
 * @param {string} [collectionSource] - Required in a multiple Collection environment only
 * @returns {Promise<string>|string}
 */
export async function getRootFolder (collectionName, collectionSource) {
  if (Session.isCollection()) {
    return process.cwd()
  }
  if (Session.isTheme()) {
    if (!collectionName) {
      throw new InternalError('Unable to find root collection root folder without the collection name.')
    }
    if (!collectionSource) {
      throw new InternalError('Unable to find root collection root folder without the collection source.')
    }
    if (collectionSource) {
      if (isRepoUrl(collectionSource)) {
        return join(process.cwd(), COLLECTIONS_INSTALL_FOLDER_NAME, collectionName)
      } else {
        return collectionSource
      }
    } else {
      throw new InternalError('Collection source is missing from shopify.theme.toml file.')
    }
  }
}

/**
 * Find Components From package.json files
 * @param {string[]} componentFolders
 * @returns {Component[]}
 */
function findComponents (componentFolders) {
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
async function getComponentFolders (collectionRootFolder) {
  const componentsFolder = join(collectionRootFolder, COMPONENTS_FOLDER)
  if (!await exists(componentsFolder)) {
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
export function getComponentNamesToBuild (components, componentNames) {
  let componentsNameTree = new Set(componentNames)

  componentNames.forEach(componentName => {
    // Find its matching component object
    const component = components.find(component => component.name === componentName)

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
 *
 * @param {module:models/Collection} collection
 * @return {Promise<module:models/Collection>}
 */
export async function initCollectionFiles (collection) {
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

export default {
  getComponentNamesToBuild,
  getRootFolder,
  initCollectionFiles
}
