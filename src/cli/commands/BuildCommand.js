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
import RecursiveRenderUtils from '../../utils/RecursiveRenderUtils.js'
import Components from '../../config/Components.js'

class BuildCommand {
  /**
   * Execute Build Command
   * @param {string} commandOption
   * @param {string} targetComponentName
   * @param {boolean} watchMode
   * @returns {Promise<FSWatcher|module:models/Collection|Section>}
   */
  static async execute (commandOption, targetComponentName, watchMode) {
    if (commandOption === Components.COLLECTION_COMPONENT_NAME) {
      if (watchMode) {
        const collection = await this.buildCollection()
        return this.watchCollection(collection)
      } else {
        return this.buildCollection()
      }
    } else if (commandOption === Components.SECTION_COMPONENT_NAME) {
      if (watchMode) {
        const section = await this.buildSection(targetComponentName)
        return this.watchSection(section)
      } else {
        return this.buildSection(targetComponentName)
      }
    }
  }

  /**
   * Build a Collection
   * @return {Promise<module:models/Collection>}
   */
  static async buildCollection () {
    const collectionName = NodeUtils.getPackageName()

    logger.info(`Starting ${collectionName}'s build...`)
    const startTime = process.hrtime()

    const collection = await CollectionFactory.fromName(collectionName)
    await CollectionBuilder.build(collection)

    logger.info(`Finished ${collectionName}'s build in ${process.hrtime(startTime).toString().slice(0, 5)} seconds`)

    return Promise.resolve(collection)
  }

  /**
   * Build a Section
   * @param sectionName
   * @return {Promise<Section>}
   */
  static async buildSection (sectionName) {
    logger.info(`Starting ${sectionName}'s build...`)
    const startTime = process.hrtime()

    const section = await SectionFactory.fromName(sectionName)
    await SectionBuilder.build(section, await CollectionUtils.findRootFolder())

    logger.info(`Finished ${sectionName}'s build in ${process.hrtime(startTime).toString().slice(0, 5)} seconds`)

    return Promise.resolve(section)
  }

  /**
   * Watch a Collection
   * @param {module:models/Collection} collection
   * @return {FSWatcher}
   */
  static watchCollection (collection) {
    const watchFolders = CollectionUtils.getWatchFolders(collection)

    const watcher = Watcher.getWatcher(watchFolders)
    const onCollectionWatchEvent = this.onCollectionWatchEvent.bind(this, watcher)
    logger.info('--------------------------------------------------------')
    logger.info(`Watching Collection ${collection.name} for changes...`)
    logger.info('(Ctrl+C to abort)')
    logger.info('--------------------------------------------------------')
    return Watcher.watch(watcher, onCollectionWatchEvent)
  }

  /**
   * Watch a Section
   * @param {Section} section
   * @return {FSWatcher}
   */
  static watchSection (section) {
    const snippetRootFolders = RecursiveRenderUtils.getSnippetRootFolders(section.renders)
    const watchFolders = [section.rootFolder].concat(snippetRootFolders).map(folder => path.join(folder, 'src'))

    const watcher = Watcher.getWatcher(watchFolders)
    const onSectionWatchEvent = this.onSectionWatchEvent.bind(this, section.name, watcher)
    logger.info('--------------------------------------------------------')
    logger.info(`Watching Section ${section.name} for changes...`)
    logger.info('(Ctrl+C to abort)')
    logger.info('--------------------------------------------------------')
    return Watcher.watch(watcher, onSectionWatchEvent)
  }

  /**
   *
   * @param {FSWatcher} watcher
   * @param {string} event
   * @param {string} eventPath
   * @return {Promise<FSWatcher|void>}
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
    logger.info('--------------------------------------------------------')
    logger.info(`Watching Collection ${collection.name} for changes...`)
    logger.info('(Ctrl+C to abort)')
    logger.info('--------------------------------------------------------')
  }

  /**
   *
   * @param {string} sectionName
   * @param {FSWatcher} watcher
   * @param {string} event
   * @param {string} eventPath
   * @return {Promise<FSWatcher|void>}
   */
  static async onSectionWatchEvent (sectionName, watcher, event, eventPath) {
    const filename = path.basename(eventPath)
    logger.info(`Watcher Event "${event}" on ${filename} detected`)

    const section = await this.buildSection(sectionName)

    // Restart Watcher on liquid file change to make sure we do refresh watcher snippet folders
    if (filename.endsWith('.liquid')) {
      await watcher.close()
      return this.watchSection(section)
    }
    logger.info('--------------------------------------------------------')
    logger.info(`Watching Section ${section.name} for changes...`)
    logger.info('(Ctrl+C to abort)')
    logger.info('--------------------------------------------------------')
  }
}

export default BuildCommand
