// Node.js imports
import { dirname, join } from 'node:path'
import gitignore from 'parse-gitignore'

// Archie Imports
import Components from '../config/Components.js'
import ConfigError from '../errors/ConfigError.js'
import FileAccessError from '../errors/FileAccessError.js'
import InternalError from '../errors/InternalError.js'
import Component from '../models/Component.js'
import Section from '../models/Section.js'
import Snippet from '../models/Snippet.js'
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
    if (Session.isSection()) {
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
   * @returns {Promise<[Component[], Section[], Snippet[]]>}
   */
  static async findComponentsFromPackageJsonFiles (packageJsonFiles) {
    const components = []
    const sections = []
    const snippets = []

    for (const packageJsonFile of packageJsonFiles) {
      const componentPackageJson = await FileUtils.getJsonFileContents(packageJsonFile)
      let componentPath = dirname(packageJsonFile)
      if (componentPackageJson.archie?.path) {
        componentPath = join(componentPath, componentPackageJson.archie.path)
      }

      if (componentPackageJson.archie && !componentPackageJson.archie.type) {
        logger.warn(`No archie component type specified in package.json file in ${componentPath}, ignoring component folder.`)
        continue
      }

      if (componentPackageJson.archie?.type) {
        if (!componentPackageJson.name) {
          throw new ConfigError(`A Component's package.json file does not provide a package name in "${packageJsonFile}"`)
        }

        let componentName = componentPackageJson.name.includes('/') ? componentPackageJson.name.split('/')[1] : componentPackageJson.name
        const componentType = componentPackageJson.archie.type.toLowerCase()

        // Strip component type from name
        componentName = componentName.replace(/-(section|snippet|component)$/, '')

        if (componentType === Components.COMPONENT_TYPE_NAME) {
          components.push(new Component(componentName, componentPath))
        } else if (componentType === Components.SECTION_COMPONENT_TYPE_NAME) {
          sections.push(new Section(componentName, componentPath))
        } else if (componentType === Components.SNIPPET_COMPONENT_TYPE_NAME) {
          snippets.push(new Snippet(componentName, componentPath))
        }
      }
    }

    return [components, sections, snippets]
  }
}

export default CollectionUtils
