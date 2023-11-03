// Node.js imports
import { dirname, join } from 'node:path'
import parse from 'parse-gitignore'

// Archie Imports
import Components from '../config/Components.js'
import ConfigError from '../errors/ConfigError.js'
import FileAccessError from '../errors/FileAccessError.js'
import InternalError from '../errors/InternalError.js'
import Component from '../models/Component.js'
import Session from '../models/static/Session.js'
import FileUtils from './FileUtils.js'
import logger from './Logger.js'
import NodeUtils from './NodeUtils.js'

const IGNORE_PATTERNS = [
  'package.json',
  'package-lock.json',
  '.git',
  '.github',
  '**/.*',
  '**/*.md'
]

class CollectionUtils {
  /**
   * Get Watch Folders for a Collection
   * @param collection
   */
  static async getIgnorePatterns (collection) {
    let gitIgnoreContents
    let gitIgnorePatterns
    const ignorePatterns = IGNORE_PATTERNS
    if (collection.gitIgnoreFile) {
      gitIgnoreContents = await FileUtils.getFileContents(join(collection.gitIgnoreFile))
      gitIgnorePatterns = parse(gitIgnoreContents)
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
      return NodeUtils.getMonorepoRootFolder()
    }
    if (Session.isCollection()) {
      return NodeUtils.getPackageRootFolder()
    }
    if (Session.isTheme()) {
      if (!collectionName) {
        throw new InternalError('Collection name is required when getting collection root folder from a theme.')
      }

      const childRepoPath = join(NodeUtils.getPackageRootFolder(), 'node_modules', Components.DEFAULT_PACKAGE_SCOPE, collectionName)
      if (await FileUtils.isReadable(childRepoPath)) {
        return childRepoPath
      }

      const parentRepoPath = join(NodeUtils.getMonorepoRootFolder(), 'node_modules', Components.DEFAULT_PACKAGE_SCOPE, collectionName)
      if (await FileUtils.isReadable(parentRepoPath)) {
        return parentRepoPath
      }

      throw new FileAccessError(`${collectionName} Collection not found or not accessible. Is it installed?`)
    }
  }

  /**
   * Find Components From package.json files
   * @param packageJsonFiles
   * @returns {Promise<Component[]>}
   */
  static async findComponents (packageJsonFiles) {
    const components = []

    for (const packageJsonFile of packageJsonFiles) {
      const componentPackageJson = await FileUtils.getJsonFileContents(packageJsonFile)
      let componentPath = dirname(packageJsonFile)
      if (componentPackageJson.archie?.path) {
        componentPath = join(componentPath, componentPackageJson.archie.path)
      }

      if (componentPackageJson.archie?.type) {
        if (!componentPackageJson.name) {
          throw new ConfigError(`Component Folder Ignored: Missing Package Name In package.json File At "${packageJsonFile}"`)
        }

        const componentName = componentPackageJson.name.includes('/') ? componentPackageJson.name.split('/')[1] : componentPackageJson.name
        const componentType = componentPackageJson.archie.type.toLowerCase()

        if (componentType === Components.COMPONENT_TYPE_NAME) {
          components.push(new Component(componentName, componentPath))
        } else {
          logger.warn(`Component Folder Ignored: Unrecognized Component Type In package.json File At ${componentPath}.`)
        }
      } else {
        logger.warn(`Component Folder Ignored: No Component Type Specified In package.json File At ${componentPath}.`)
      }
    }

    return components
  }
}

export default CollectionUtils
