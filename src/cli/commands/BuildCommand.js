// Node imports
import path from 'path'

// External Modules imports
// eslint-disable-next-line no-unused-vars
import { FSWatcher } from 'chokidar'

// Archie imports
import CollectionBuilder from '../../builders/CollectionBuilder.js'
import SectionBuilder from '../../builders/SectionBuilder.js'
import CollectionFactory from '../../factory/CollectionFactory.js'
import SectionFactory from '../../factory/SectionFactory.js'
import CollectionUtils from '../../utils/CollectionUtils.js'
import logger from '../../utils/Logger.js'
import Watcher from '../../utils/Watcher.js'
import NodeUtils from '../../utils/NodeUtils.js'
import RenderUtils from '../../utils/RenderUtils.js'
import Components from '../../config/Components.js'

class BuildCommand {
  /**
   * Execute Build Command
   * @param {string} commandOption
   * @param {string} targetComponentName
   * @param {boolean} watchMode
   * @return {Promise<Awaited<void>[]>}
   */
  static async execute (commandOption, targetComponentName, watchMode) {
    const promises = []

    if (commandOption === Components.COLLECTION_COMPONENT_NAME) {
      const collection = await this.buildCollection()
      if (watchMode) {
        promises.push(this.watchCollection(collection))
      }
    }
    // Build/Watch Section
    else if (commandOption === Components.SECTION_COMPONENT_NAME) {
      logger.info(`Building "${targetComponentName}" section`)
      console.time(`Building "${targetComponentName}" section`)

      const section = await this.buildSection(targetComponentName)

      logger.info(`${targetComponentName}: Build Complete`)
      console.timeEnd(`Building "${targetComponentName}" section`)

      if (watchMode) {
        await this.watchSection(section)
      }
    }

    return Promise.all(promises)
  }

  /**
   * Build a Collection
   * @return {Promise<module:models/Collection>}
   */
  static async buildCollection () {
    const collectionName = NodeUtils.getPackageName()
    const collectRootFolder = NodeUtils.getPackageRootFolder()

    logger.info(`Building ${collectionName} Collection ...`)
    console.time(`Building "${collectionName}" collection`)

    const collection = await CollectionFactory.fromNameAndFolder(collectionName, collectRootFolder)
    await CollectionBuilder.build(collection)

    logger.info(`${collectionName}: Build Complete`)
    console.timeEnd(`Building "${collectionName}" collection`)

    return Promise.resolve(collection)
  }

  /**
   * Build a Section
   * @param sectionName
   * @return {Promise<Section>}
   */
  static async buildSection (sectionName) {
    const section = await SectionFactory.fromName(sectionName)
    await SectionBuilder.build(section)
    return Promise.resolve(section)
  }

  /**
   * Watch a Collection
   * @param {module:models/Collection} collection
   * @return {Promise<void>}
   */
  static async watchCollection (collection) {
    const watchFolders = CollectionUtils.getWatchFolders(collection)

    const watcher = Watcher.getWatcher(watchFolders)
    const onCollectionWatchEvent = this.onCollectionWatchEvent.bind(null, watcher)
    Watcher.watch(watcher, onCollectionWatchEvent)
  }

  /**
   * Watch a Section
   * @param {Section} section
   * @return {Promise<void>}
   */
  static async watchSection (section) {
    const snippetRootFolders = RenderUtils.getSnippetRootFolders(section.renders)
    const watchFolders = [section.rootFolder].concat(snippetRootFolders).map(folder => path.join(folder, 'src'))

    const watcher = Watcher.getWatcher(watchFolders)
    const onSectionWatchEvent = this.onSectionWatchEvent.bind(null, section.name, watcher)
    Watcher.watch(watcher, onSectionWatchEvent)
  }

  /**
   *
   * @param {FSWatcher} watcher
   * @param {string} event
   * @param {string} eventPath
   * @return {Promise<void>}
   */
  static async onCollectionWatchEvent (watcher, event, eventPath) {
    const filename = path.basename(eventPath)
    logger.debug(`Watcher Event: "${event}" on file: ${eventPath} detected`)
    const collection = await this.buildCollection()
    // Restart Watcher on liquid file change to make sure we do refresh watcher snippet folders
    if (filename.endsWith('.liquid')) {
      await watcher.close()
      return this.watchCollection(collection)
    }
  }

  /**
   *
   * @param {string} sectionName
   * @param {FSWatcher} watcher
   * @param {string} event
   * @param {string} eventPath
   * @return {Promise<void>}
   */
  static async onSectionWatchEvent (sectionName, watcher, event, eventPath) {
    const filename = path.basename(eventPath)
    logger.info(`Watcher Event: "${event}" on file: ${filename} detected`)

    logger.info(`Building "${sectionName}" section`)
    console.time(`Building "${sectionName}" section`)

    const section = await this.buildSection(sectionName)

    logger.info(`${sectionName}: Build Complete`)
    console.timeEnd(`Building "${sectionName}" section`)
    // Restart Watcher on liquid file change to make sure we do refresh watcher snippet folders
    if (filename.endsWith('.liquid')) {
      await watcher.close()
      return this.watchSection(section)
    }
  }
}

export default BuildCommand
