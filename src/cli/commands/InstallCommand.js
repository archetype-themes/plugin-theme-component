// Node imports
import path from 'node:path'

// Archie imports
import ThemeFactory from '../../factory/ThemeFactory.js'
import CollectionInstaller from '../../Installers/CollectionInstaller.js'
import CollectionUtils from '../../utils/CollectionUtils.js'
import logger from '../../utils/Logger.js'
import Timer from '../../utils/Timer.js'
import Watcher from '../../utils/Watcher.js'
import BuildCommand from './BuildCommand.js'

class InstallCommand {
  /**
   * Execute Install command
   * @param {string} collectionName
   * @param {boolean} backupMode
   * @param {boolean} watchMode
   * @return {Promise<Awaited<void>[]>}
   */
  static async execute (collectionName, backupMode, watchMode) {
    const promises = []

    const collection = await InstallCommand.installOne(collectionName, backupMode)

    if (watchMode) {
      promises.push(this.watch(collection, backupMode))
    }

    return Promise.all(promises)
  }

  /**
   * Install a Collection
   * @param {string} collectionName
   * @param {boolean} backupMode
   * @return {Promise<module:models/Collection>}
   */
  static async installOne (collectionName, backupMode) {
    logger.info(`Building & Installing the ${collectionName} Collection.`)
    const startTime = Timer.getTimer()

    // Creating Theme
    const theme = ThemeFactory.fromThemeInstallCommand()

    // Build using the Build Command
    const collection = await BuildCommand.buildCollection(collectionName)

    // Install and time it!
    logger.info(`Installing the ${collectionName} Collection for the ${theme.name} Theme.`)
    const installStartTime = Timer.getTimer()
    await CollectionInstaller.install(theme, collection, backupMode)
    logger.info(`${collection.name}: Install Complete in ${Timer.getEndTimerInSeconds(installStartTime)} seconds`)
    logger.info(`${collection.name}: Build & Install Completed in ${Timer.getEndTimerInSeconds(startTime)} seconds\n`)
    return Promise.resolve(collection)
  }

  /**
   * On Collection Watch Event
   * @param {string} collectionName
   * @param {boolean} backupMode
   * @param {FSWatcher} watcher
   * @param event
   * @param eventPath
   * @return {Promise<module: models/Collection>}
   */
  static async onCollectionWatchEvent (collectionName, backupMode, watcher, event, eventPath) {
    const filename = path.basename(eventPath)
    logger.debug(`Watcher Event: "${event}" on file: ${filename} detected`)

    const collection = await InstallCommand.installOne(collectionName, backupMode)

    // The Watcher is restarted on any liquid file change.
    // This is useful if any render tags were added or removed, it will reset snippet watched folders.
    if (filename.endsWith('.liquid')) {
      await watcher.close()
      return InstallCommand.watch(collection, backupMode)
    }
  }

  /**
   * Build and Install Collection in Current Theme on File Change
   * @param {module:models/Collection} collection
   * @param {boolean} backupMode
   * @return {Promise<module: models/Collection>}
   */
  static async watch (collection, backupMode) {
    const watchFolders = CollectionUtils.getWatchFolders(collection)

    const watcher = Watcher.getWatcher(watchFolders)

    const onCollectionWatchEvent = this.onCollectionWatchEvent.bind(null, collection.name, backupMode, watcher)
    Watcher.watch(watcher, onCollectionWatchEvent)
  }
}

export default InstallCommand
