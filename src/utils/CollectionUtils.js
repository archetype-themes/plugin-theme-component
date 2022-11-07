import { access, readdir } from 'node:fs/promises'
import path from 'path'
import { constants } from 'node:fs'
import ComponentUtils from './ComponentUtils.js'

class CollectionUtils {
  /**
   * Find Section Names
   * @param {module:models/Collection} collection
   * @return {Promise<void>}
   */
  static async findSectionNames (collection) {
    const entries = await readdir(collection.sectionsFolder, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const sectionFolder = path.join(collection.sectionsFolder, entry.name)
          await access(sectionFolder + '/package.json', constants.R_OK)
          collection.sectionNames.push(entry.name)
        } catch {}
      }
    }
  }

  /**
   * Get Watch Folders for a Collection
   * @param collection
   * @return {string[]}
   */
  static getWatchFolders (collection) {
    let watchFolders = []

    for (const section of collection.sections) {
      watchFolders.push(section.rootFolder)
      for (const snippetRootFolder of ComponentUtils.getSnippetRootFoldersFromRenders(section.renders)) {
        if (!watchFolders.includes(snippetRootFolder)) {
          watchFolders.push(snippetRootFolder)
        }
      }
    }

    return watchFolders.map(folder => path.join(folder, 'src'))
  }
}

export default CollectionUtils
