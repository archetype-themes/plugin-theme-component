import { access, readdir } from 'node:fs/promises'
import { join } from 'path'
import { constants } from 'node:fs'

class CollectionUtils {
  /**
   * Find Section Names
   * @param {Collection} collection
   * @return {Promise<void>}
   */
  static async findSectionNames (collection) {
    const entries = await readdir(collection.sectionsFolder, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const sectionFolder = join(collection.sectionsFolder, entry.name)
          await access(sectionFolder + '/package.json', constants.R_OK)
          collection.sectionNames.push(entry.name)
        } catch {}
      }
    }
  }
}

export default CollectionUtils
