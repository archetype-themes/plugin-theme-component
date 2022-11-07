//Node imports
import path from 'path'

// Archie imports
import CollectionBuilder from '../../builders/CollectionBuilder.js'
import SectionBuilder from '../../builders/SectionBuilder.js'
import CollectionFactory from '../../factory/CollectionFactory.js'
import SectionFactory from '../../factory/SectionFactory.js'
import Collection from '../../models/Collection.js'
import Section from '../../models/Section.js'
import CollectionUtils from '../../utils/CollectionUtils.js'
import ComponentUtils from '../../utils/ComponentUtils.js'
import logger from '../../utils/Logger.js'
import Watcher from '../../utils/Watcher.js'

class BuildCommand {
  /** @type {string} **/
  static NAME = 'build'
  /** @type {string[]} **/
  static ENABLED_COMPONENTS = [Collection.COMPONENT_NAME, Section.COMPONENT_NAME]
  /** @type {string[]} **/
  static AVAILABLE_OPTIONS = [Collection.COMPONENT_NAME, Section.COMPONENT_NAME]

  /**
   * Execute Build Command
   * @param {string} commandOption
   * @param {string} targetComponentName
   * @param {boolean} watchMode
   * @return {Promise<Awaited<void>[]>}
   */
  static async execute (commandOption, targetComponentName, watchMode) {
    const promises = []

    if (commandOption === Collection.COMPONENT_NAME) {
      const collection = await this.buildCollection()
      if (watchMode) {
        promises.push(this.watchCollection(collection))
      }
    }
    // Build/Watch Section
    else if (commandOption === Section.COMPONENT_NAME) {
      const section = await this.buildSection(targetComponentName)

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
    const collection = await CollectionFactory.fromCollectionBuildCommand()
    collection.sections = await SectionFactory.fromCollection(collection)
    await CollectionBuilder.build(collection)
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
    console.log(watchFolders)

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
    const snippetRootFolders = ComponentUtils.getSnippetRootFoldersFromRenders(section.renders)
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
    const collection = await BuildCommand.buildCollection()
    // Restart Watcher on liquid file change to make sure we do refresh watcher snippet folders
    if (filename.endsWith('.liquid')) {
      await watcher.close()
      return BuildCommand.watchCollection(collection)
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
    const section = await BuildCommand.buildSection(sectionName)
    // Restart Watcher on liquid file change to make sure we do refresh watcher snippet folders
    if (filename.endsWith('.liquid')) {
      await watcher.close()
      return BuildCommand.watchSection(section)
    }
  }
}

export default BuildCommand
