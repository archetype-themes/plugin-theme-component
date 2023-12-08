// Node imports
import path from 'node:path'
import ThemeFactory from '../factory/ThemeFactory.js'
import Session from '../models/static/Session.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import logger from '../utils/Logger.js'
import NodeUtils from '../utils/NodeUtils.js'
import { getTimeElapsed, getTimer } from '../utils/Timer.js'
import Watcher from '../utils/Watcher.js'

// Internal Imports
import BuildCommand from './BuildCommand.js'
import CollectionInstaller from './runners/CollectionInstaller.js'

class InstallCommand {
  /**
   * Execute Install command
   * @return {Promise<Awaited<void>[]>}
   */
  static async execute () {
    const promises = []

    let collectionsList
    // If we have only one element as a string, convert it to object form.
    if (NodeUtils.isString(Session.targets)) {
      collectionsList = {}
      collectionsList[Session.targets] = []
    } else {
      collectionsList = Session.targets
    }

    for (const [collectionName, componentNames] of Object.entries(collectionsList)) {
      const collection = await InstallCommand.installOne(collectionName, componentNames)

      if (Session.watchMode) {
        promises.push(this.watch(collection))
      }
    }

    return Promise.all(promises)
  }

  /**
   * Install a Collection
   * @param {string} collectionName
   * @param {string[]} componentNames
   * @return {Promise<module:models/Collection>}
   */
  static async installOne (collectionName, componentNames) {
    logger.info(`Building & Installing the ${collectionName} Collection.`)
    const startTime = getTimer()

    // Creating Theme
    const theme = ThemeFactory.fromThemeInstallCommand()

    // Build using the Build Command
    const collection = await BuildCommand.buildCollection(collectionName, componentNames)
    await BuildCommand.deployCollection(collection)
    // Install and time it!
    logger.info(`Installing the ${collectionName} Collection for the ${theme.name} Theme.`)
    const installStartTime = getTimer()
    await CollectionInstaller.install(theme, collection)
    logger.info(`${collection.name}: Install Complete in ${getTimeElapsed(installStartTime)} seconds`)
    logger.info(`${collection.name}: Build & Install Completed in ${getTimeElapsed(startTime)} seconds\n`)
    return Promise.resolve(collection)
  }

  /**
   * On Collection Watch Event
   * @param {string} collectionName
   * @param {string[]} componentNames
   * @param {FSWatcher} watcher
   * @param event
   * @param eventPath
   * @return {Promise<module: models/Collection>}
   */
  static async onCollectionWatchEvent (collectionName, componentNames, watcher, event, eventPath) {
    const filename = path.basename(eventPath)
    logger.debug(`Watcher Event: "${event}" on file: ${filename} detected`)

    const collection = await InstallCommand.installOne(collectionName, componentNames)

    // The Watcher is restarted on any liquid file change.
    // This is useful if any render tags were added or removed, it will reset snippet watched folders.
    if (filename.endsWith('.liquid')) {
      await watcher.close()
      return InstallCommand.watch(collection)
    }
  }

  /**
   * Build and Install Collection in Current Theme on File Change
   * @param {module:models/Collection} collection
   * @return {Promise<module: models/Collection>}
   */
  static async watch (collection) {
    const ignorePatterns = CollectionUtils.getIgnorePatterns(collection)

    const watcher = Watcher.getWatcher(collection.rootFolder, ignorePatterns)

    const onCollectionWatchEvent = this.onCollectionWatchEvent.bind(null, collection.name, collection.componentNames, watcher)
    Watcher.watch(watcher, onCollectionWatchEvent)
  }
}

export default InstallCommand
