// Node.js imports
import { access, constants } from 'node:fs/promises'
import { basename, join } from 'node:path'

// Archie Imports
import CLISession from '../cli/models/CLISession.js'
import Components from '../config/Components.js'
import FileAccessError from '../errors/FileAccessError.js'
import InternalError from '../errors/InternalError.js'
import FileUtils from './FileUtils.js'
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
    if (CLISession.isSection()) {
      return NodeUtils.getMonorepoRootFolder()
    }
    if (CLISession.isCollection()) {
      return NodeUtils.getPackageRootFolder()
    }
    if (CLISession.isTheme()) {
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
}

export default CollectionUtils
