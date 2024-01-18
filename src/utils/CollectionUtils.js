// Node.js imports
import { join, resolve } from 'node:path'
import gitignore from 'parse-gitignore'

// Internal Imports
import FileAccessError from '../errors/FileAccessError.js'
import InternalError from '../errors/InternalError.js'
import Component from '../models/Component.js'
import Session from '../models/static/Session.js'
import FileUtils from './FileUtils.js'
import { COLLECTIONS_FOLDER_NAME } from '../config/CLI.js'
import {
} from './NodeUtils.js'

const IGNORE_PATTERNS = [
  'package.json',
  'package-lock.json',
  '.git',
  '.github',
  '.explorer',
  'shopify.theme.toml',
  'bin',
  '**/.*',
  '**/*.md'
]

class CollectionUtils {
  /**
   * Get Watch Folders for a Collection
   * @param {module:models/Collection} collection
   * @returns {string[]}
   */
  static getIgnorePatterns (collection) {
    const ignorePatterns = IGNORE_PATTERNS
    if (collection.gitIgnoreFile) {
      const gitIgnorePatterns = gitignore.parse(collection.gitIgnoreFile).patterns
      ignorePatterns.push(...gitIgnorePatterns)
    }
    return ignorePatterns
  }

  /**
   * Get Collection Root Folder
   * @param {string} [collectionName] - Only Required in a multiple Collection environment only - not fully implemented yet.
   * @returns {Promise<string>|string}
   */
  static async findRootFolder (collectionName) {
    if (Session.isComponent()) {
      return process.cwd()
    }
    if (Session.isCollection()) {
      return process.cwd()
    }
    if (Session.isTheme()) {
      if (!collectionName) {
        throw new InternalError('Collection name is required when getting collection root folder from a theme.')
      }

      const childRepoPath = join(resolve(COLLECTIONS_FOLDER_NAME), collectionName)
      if (await FileUtils.isReadable(childRepoPath)) {
        return childRepoPath
      }

      const parentRepoPath = join(resolve(COLLECTIONS_FOLDER_NAME), collectionName)
      if (await FileUtils.isReadable(parentRepoPath)) {
        return parentRepoPath
      }

      throw new FileAccessError(`${collectionName} Collection not found or not accessible. Is it installed?`)
    }
  }

  /**
   * Find Components From package.json files
   * @param {string[]} componentFolders
   * @returns {Component[]}
   */
  static findComponents (componentFolders) {
    const components = []

    for (let i = 0; i < componentFolders.length; i++) {
      const componentPath = componentFolders[i]
      const componentName = componentPath.split('/').pop()
      components.push(new Component(componentName, componentPath))
    }

    return components
  }

  /**
   * Get Collection's Component Folders
   * @param {string} collectionRootFolder
   * @returns {Promise<string[]>}
   */
  static async getComponentFolders (collectionRootFolder) {
    const componentsDir = 'components'

    return FileUtils.getFolders(join(collectionRootFolder, componentsDir))
  }

  /**
   *
   * @param {(Component|Snippet)[]} components
   * @param {string[]} componentNames
   * @returns {Set}
   */
  static getComponentsNameTree (components, componentNames) {
    let componentsNameTree = new Set(componentNames)

    componentNames.forEach(componentName => {
      // Find its matching component object
      const component = components.find(component => component.name === componentName)
      // Recursive call applied to snippet names
      const componentNameTree = this.getComponentsNameTree(components, component.snippetNames)
      // Merge data with the global Set
      componentsNameTree = new Set([...componentsNameTree, ...componentNameTree])
    })

    return componentsNameTree
  }
}

export default CollectionUtils
