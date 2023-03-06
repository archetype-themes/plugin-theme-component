// Node imports
import path from 'path'

// Archie imports
import CollectionBuilder from '../../builders/CollectionBuilder.js'
import CollectionFactory from '../../factory/CollectionFactory.js'
import ThemeFactory from '../../factory/ThemeFactory.js'
import CollectionInstaller from '../../Installers/CollectionInstaller.js'
import CollectionUtils from '../../utils/CollectionUtils.js'
import logger from '../../utils/Logger.js'
import Watcher from '../../utils/Watcher.js'
import ThemeUtils from '../../utils/ThemeUtils.js'

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
   * @return {Promise<Collection>}
   */
  static async installOne (collectionName, backupMode) {
    // Creating Theme
    const theme = ThemeFactory.fromThemeInstallCommand()

    // Log & timer
    logger.info(`Building ${collectionName} Collection ...`)
    console.time(`Building "${collectionName}" collection`)

    // Creating Collection and its children
    const collectionRootFolder = await ThemeUtils.findCollectionPackageRootFolder(collectionName)
    const collection = await CollectionFactory.fromNameAndFolder(collectionName, collectionRootFolder)
    // Build and install Collection
    await CollectionBuilder.build(collection)

    // Log & timer
    logger.info(`${collectionName}: Build Complete`)
    console.timeEnd(`Building "${collectionName}" collection`)

    await CollectionInstaller.install(theme, collection, backupMode)

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
