// Node imports
import path from 'node:path'
import ThemeFactory from '../factory/ThemeFactory.js'
import Session from '../models/static/Session.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import logger, { logSpacer } from '../utils/Logger.js'
import Timer from '../models/Timer.js'
import Watcher from '../utils/Watcher.js'

// Internal Imports
import BuildCommand from './BuildCommand.js'
import CollectionInstaller from './runners/CollectionInstaller.js'
import CollectionFactory from '../factory/CollectionFactory.js'
import { isUrl } from '../utils/WebUtils.js'

class InstallCommand {
  /**
   * Execute Install command
   * @return {Promise<Awaited<void>[]>}
   */
  static async execute () {
    const promises = []

    for (const collectionEntry of Object.entries(Session.targets)) {

      const collection = await CollectionFactory.fromTomlEntry(collectionEntry)
      await InstallCommand.installOne(collection)

      if (Session.watchMode) {
        if (isUrl(collectionEntry[1].source)) {
          logger.error(`Ignoring "${collection.name}": Unable To Watch Collection from a remote URL`)
        } else {
          promises.push(this.watch(collection))
        }
      }
    }
    Session.firstRun = false

    return Promise.all(promises)
  }

  /**
   * Install a Collection
   * @param {module:models/Collection} collection
   * @return {Promise<module:models/Collection>}
   */
  static async installOne (collection) {
    logger.info(`Building & Installing the ${collection.name} Collection.`)
    const startTime = new Timer()

    // Creating Theme
    const theme = ThemeFactory.fromThemeInstallCommand()

    // Build using the Build Command
    await BuildCommand.buildCollection(collection)
    await BuildCommand.deployCollection(collection)
    // Install and time it!
    logger.info(`Installing the ${collection.name} Collection for the ${theme.name} Theme.`)
    const installStartTime = new Timer()
    await CollectionInstaller.install(theme, collection)
    logger.info(`${collection.name}: Install Complete in ${installStartTime.now()} seconds`)
    logger.info(`${collection.name}: Build & Install Completed in ${startTime.now()} seconds\n`)
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

    const collection = await CollectionFactory.fromName(collectionName, componentNames)
    await InstallCommand.installOne(collection)

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
    logSpacer()
    logger.info('--------------------------------------------------------')
    logger.info(`${collection.name}: Watching component tree for changes`)
    logger.info('(Ctrl+C to abort)')
    logger.info('--------------------------------------------------------')
    logSpacer()
    Watcher.watch(watcher, onCollectionWatchEvent)
  }
}

export default InstallCommand
