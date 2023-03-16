// NodeJS imports
import { access, constants, readdir } from 'node:fs/promises'
import path from 'path'
import NodeConfig from '../cli/models/NodeConfig.js'
import NodeUtils from './NodeUtils.js'

// Archie imports
import RenderUtils from './RenderUtils.js'
import ThemeUtils from './ThemeUtils.js'

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
          const sectionFolder = path.join(sectionsFolder, entry.name)
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
      for (const snippetRootFolder of RenderUtils.getSnippetRootFolders(section.renders)) {
        if (!watchFolders.includes(snippetRootFolder)) {
          watchFolders.push(snippetRootFolder)
        }
      }
    }

    return watchFolders.map(folder => path.join(folder, 'src'))
  }

  /**
   * Get Collection Root Folder
   * @param {string} [collectionName] - Required when getting collection root folder from a theme.
   * @returns {Promise<string>|string}
   */
  static getRootFolder (collectionName) {
    if (NodeConfig.isSection()) {
      return NodeUtils.getMonorepoRootFolder()
    }
    if (NodeConfig.isCollection()) {
      return NodeUtils.getPackageRootFolder()
    }
    if (NodeConfig.isTheme()) {
      if (!collectionName) {
        throw new Error('Collection name is required when getting collection root folder from a theme.')
      }
      return ThemeUtils.findCollectionPackageRootFolder(collectionName)
    }
  }
}

export default CollectionUtils
