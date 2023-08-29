// Node imports
import path from 'node:path'

// External Modules imports
// eslint-disable-next-line no-unused-vars
import { FSWatcher } from 'chokidar'

// Archie imports
import CollectionBuilder from '../../main/builders/CollectionBuilder.js'
import SectionBuilder from '../../main/builders/SectionBuilder.js'
import CollectionFactory from '../../main/factory/CollectionFactory.js'
import SectionFactory from '../../main/factory/SectionFactory.js'
import CollectionUtils from '../../utils/CollectionUtils.js'
import logger from '../../utils/Logger.js'
import Timer from '../../utils/Timer.js'
import Watcher from '../../utils/Watcher.js'
import NodeUtils from '../../utils/NodeUtils.js'
import SnippetUtils from '../../utils/SnippetUtils.js'
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
      const collectionName = NodeUtils.getPackageName()
      if (watchMode) {
        const collection = await this.buildCollection(collectionName)
        return this.watchCollection(collection)
      } else {
        return this.buildCollection(collectionName)
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
   * @param {string} collectionName
   * @return {Promise<module:models/Collection>}
   */
  static async buildCollection (collectionName) {
    logger.info(`Starting ${collectionName}'s build...`)
    const startTime = Timer.getTimer()

    const collection = await CollectionFactory.fromName(collectionName)
    logger.info(`${collectionName}'s factory preparation completed in ${Timer.getEndTimerInSeconds(startTime)} seconds`)

    // Step 1: Start from the bottom: Build Snippets first, synchronously, but with a cache
    logger.info(`Step 1/3 - Beginning Snippets' build for ${collection.name}`)
    const stepOneStartTime = Timer.getTimer()

    for (const section of collection.sections) {
      if (section.snippets?.length) {
        await SnippetUtils.buildRecursively(section.snippets)
      }
    }
    logger.info(`Step 1/3 - Finished Snippets' build in ${Timer.getEndTimerInSeconds(stepOneStartTime)} seconds`)

    // Step 2: Build Sections Concurrently
    const stepTwoStartTime = Timer.getTimer()
    logger.info(`Step 2/3 - Starting Sections' build for: ${collection.name}`)
    const promises = []
    for (const section of collection.sections) {
      promises.push(SectionBuilder.build(section))
    }
    await Promise.all(promises)
    logger.info(`Step 2/3 - Finished Sections' build in ${Timer.getEndTimerInSeconds(stepTwoStartTime)} seconds`)

    // Step 3: Build The Collection
    const stepThreeStartTime = Timer.getTimer()
    logger.info(`Step 3/3 - Starting Final Collection build for: ${collection.name}`)
    await CollectionBuilder.build(collection)
    logger.info(`Step 3/3 - Finished Collection's build in ${Timer.getEndTimerInSeconds(stepThreeStartTime)} seconds`)
    logger.info(`Completed all three steps for ${collectionName}'s build in ${Timer.getEndTimerInSeconds(startTime)} seconds`)

    return Promise.resolve(collection)
  }

  /**
   * Build a Section
   * @param sectionName
   * @return {Promise<Section>}
   */
  static async buildSection (sectionName) {
    logger.info(`Starting ${sectionName}'s build...`)
    const startTime = Timer.getTimer()

    const section = await SectionFactory.fromName(sectionName)

    // Start from the bottom: Build Snippets first
    if (section.snippets?.length) {
      await SnippetUtils.buildRecursively(section.snippets)
    }
    // Build Section
    await SectionBuilder.build(section)
    // Write Build To Disk
    await SectionBuilder.writeBuild(section, await CollectionUtils.findRootFolder())
    logger.info(`Finished ${sectionName}'s build in ${Timer.getEndTimerInSeconds(startTime)} seconds`)

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
    const snippetRootFolders = SnippetUtils.getRootFoldersRecursively(section.snippets)
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
    const collection = await this.buildCollection(NodeUtils.getPackageName())
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
