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

  static install (collectionName) {
    logger.info(`Installing ${collectionName} Collection for ${env.npm_package_name}.`)
  }
}

export default CollectionBuilder
