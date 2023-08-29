// Node.js imports
import { access, constants, readdir } from 'node:fs/promises'
import { join } from 'path'
import NodeConfig from '../cli/models/NodeConfig.js'
import Components from '../config/Components.js'
import FileAccessError from '../errors/FileAccessError.js'
import InternalError from '../errors/InternalError.js'
import FileUtils from './FileUtils.js'
import NodeUtils from './NodeUtils.js'

// Archie imports
import SnippetUtils from './SnippetUtils.js'

class CollectionUtils {
  /**
   * Find Section Names
   * @param {string} sectionsFolder
   * @return {Promise<string[]>}
   */
  static async findSectionNames (sectionsFolder) {
    const sectionNames = []
    const entries = await readdir(sectionsFolder, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const sectionFolder = join(sectionsFolder, entry.name)
          await access(sectionFolder + '/package.json', constants.R_OK)
          sectionNames.push(entry.name)
        } catch {}
      }
    }
    return sectionNames
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
    if (NodeConfig.isSection()) {
      return NodeUtils.getMonorepoRootFolder()
    }
    if (NodeConfig.isCollection()) {
      return NodeUtils.getPackageRootFolder()
    }
    if (NodeConfig.isTheme()) {
      if (!collectionName && NodeConfig.collections.length === 1) {
        collectionName = NodeConfig.collections[0]
      }
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
