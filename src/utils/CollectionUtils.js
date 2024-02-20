// Node.js imports
import { join } from 'node:path'
import gitignore from 'parse-gitignore'

// Internal Imports
import { COLLECTIONS_FOLDER_NAME, CONFIG_FILE_NAME, DEV_FOLDER_NAME } from '../config/CLI.js'
import InternalError from '../errors/InternalError.js'
import Component from '../models/Component.js'
import Session from '../models/static/Session.js'

import { exists, getFolders } from './FileUtils.js'
import { isRepoUrl } from './WebUtils.js'
import FileMissingError from '../errors/FileMissingError.js'

const IGNORE_PATTERNS = [
  'package.json',
  'package-lock.json',
  '.git',
  '.github',
  DEV_FOLDER_NAME,
  CONFIG_FILE_NAME,
  'bin',
  '**/.*',
  '**/*.md'
]

const COMPONENTS_FOLDER = 'components'

/**
 * Get Watch Folders for a Collection
 * @param {module:models/Collection} collection
 * @returns {string[]}
 */
export function getIgnorePatterns (collection) {
  const ignorePatterns = IGNORE_PATTERNS
  if (collection.gitIgnoreFile) {
    const gitIgnorePatterns = gitignore.parse(collection.gitIgnoreFile).patterns
    ignorePatterns.push(...gitIgnorePatterns)
  }
  return ignorePatterns
}

/**
 * Get Collection Root Folder
 * @param {string} [collectionName] - Required in a multiple Collection environment only
 * @param {string} [collectionSource] - Required in a multiple Collection environment only
 * @returns {Promise<string>|string}
 */
export async function findRootFolder (collectionName, collectionSource) {
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
        return join(process.cwd(), COLLECTIONS_FOLDER_NAME, collectionName)
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
  findRootFolder,
  getComponentNamesToBuild,
  getIgnorePatterns,
  initCollectionFiles
}
