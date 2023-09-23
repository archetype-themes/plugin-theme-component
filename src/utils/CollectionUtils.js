// Node.js imports
import { access, constants } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'

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
import SnippetUtils from './SnippetUtils.js'

class CollectionUtils {
  /**
   * Find Component Folders
   * @param {string} collectionRootFolder
   * @returns {Promise<string[]>}
   */
  static async findComponentFolders (collectionRootFolder) {
    const folderNames = await FileUtils.getFolders(collectionRootFolder, true)

    return folderNames.filter(folderName => {
      const folderBasename = basename(folderName)
      return /(sections|components)/i.test(folderBasename)
    })
  }

  /**
   * Find Component Names
   * @param {string|string[]} componentFolders
   * @return {Promise<string[]>}
   */
  static async findComponentNames (componentFolders) {
    if (NodeUtils.isString(componentFolders)) {
      componentFolders = [componentFolders]
    }

    // Asynchronously check all component folders for valid components in their sub-folders
    const allComponentNamePromises = componentFolders.map(componentFolder => this.getNamesForComponentFolder(componentFolder))
    // Flatten the 2D array structure into a single array
    const allComponentNamesNested = (await Promise.all(allComponentNamePromises)).flat()

    // Removes the null values
    return allComponentNamesNested.filter(name => name)
  }

  static async getNamesForComponentFolder (componentFolder) {
    const singleComponentFolders = await FileUtils.getFolders(componentFolder)
    const componentNamesForThisFolder = singleComponentFolders.map(singleComponentFolder => this.getValidComponentName(singleComponentFolder))

    return Promise.all(componentNamesForThisFolder)
  }

  /**
   * Get Valid Component Name
   * @param {string} singleComponentFolder
   * @returns {Promise<null|string>}
   */
  static async getValidComponentName (singleComponentFolder) {
    try {
      await access(join(singleComponentFolder, 'package.json'), constants.R_OK)
      return basename(singleComponentFolder)
    } catch (err) {
      return null // Use null to signify that the file doesn't exist or isn't readable
    }
  }

  /**
   * Get Watch Folders for a Collection
   * @param collection
   * @return {string[]}
   */
  static getWatchFolders (collection) {
    const watchFolders = []

    for (const section of collection.sections) {
      watchFolders.push(section.rootFolder)
      for (const snippetRootFolder of SnippetUtils.getRootFoldersRecursively(section.snippets)) {
        if (!watchFolders.includes(snippetRootFolder)) {
          watchFolders.push(snippetRootFolder)
        }
      }
    }

    return watchFolders.map(folder => join(folder, 'src'))
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
