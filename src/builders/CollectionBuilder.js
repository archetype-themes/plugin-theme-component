import logger from '../utils/Logger.js'
import { env } from 'node:process'
import { access, mkdir, readdir, rm } from 'node:fs/promises'
import { constants } from 'node:fs'
import SectionBuilder from './SectionBuilder.js'
import SectionFactory from '../factory/SectionFactory.js'
import FileUtils from '../utils/FileUtils.js'
import { join } from 'path'

class CollectionBuilder {
  /**
   *
   * @param {Collection} collection
   * @return {Promise<void>}
   */
  static async build (collection) {
    logger.info(`Building ${collection.name} Collection ...`)
    console.time(`Building "${collection.name}" collection`)

    if (collection.sectionNames.length === 0) {
      logger.info(`No section list found for ${collection.name}; all sections will be processed.`)
      await this.#findSectionNames(collection)
    }

    logger.info(`We will bundle the following sections: ${collection.sectionNames.join(', ')}`)

    console.log(collection.sectionNames)

    for (const sectionName of collection.sectionNames) {
      const section = await SectionFactory.fromName(sectionName, collection)
      collection.sections.push(await SectionBuilder.build(section))
    }

    await this.#resetBuildFolders(collection)

    for (const section of collection.sections) {
      try {
        await FileUtils.copyFolder(section.build.rootFolder, collection.build.sectionsFolder)
        await FileUtils.copyFolder(section.build.assetsFolder, collection.build.assetsFolder)
        await FileUtils.copyFolder(section.build.snippetsFolder, collection.build.snippetsFolder)
      } catch {
        //Errors ignored as some sections folders might not exist if there is no particular content for that section
      }

    }

  }

  static async install (collection) {
    await this.build(collection)
    logger.info(`Installing ${collection} Collection for ${env.npm_package_name}.`)
  }

  static async #findSectionNames (collection) {
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

  /**
   *
   * @param {Collection} collection
   * @return {Promise<void>}
   */
  static async #resetBuildFolders (collection) {
    await rm(collection.build.rootFolder, { force: true, recursive: true })

    await mkdir(collection.build.rootFolder, { recursive: true })
    await mkdir(collection.build.assetsFolder, { recursive: true })
    await mkdir(collection.build.localesFolder, { recursive: true })
    await mkdir(collection.build.sectionsFolder, { recursive: true })
    await mkdir(collection.build.snippetsFolder, { recursive: true })
  }
}

export default CollectionBuilder
