// Node imports
import path from 'path'

//Archie imports
import CollectionBuilder from '../../builders/CollectionBuilder.js'
import CollectionFactory from '../../factory/CollectionFactory.js'
import ThemeFactory from '../../factory/ThemeFactory.js'
import CollectionInstaller from '../../Installers/CollectionInstaller.js'
import Collection from '../../models/Collection.js'
import Theme from '../../models/Theme.js'
import CollectionUtils from '../../utils/CollectionUtils.js'
import logger from '../../utils/Logger.js'
import Watcher from '../../utils/Watcher.js'

class InstallCommand {
  /** @type {string} **/
  static NAME = 'install'
  /** @type {string[]} **/
  static ENABLED_COMPONENTS = [Theme.COMPONENT_NAME]
  /** @type {string[]} **/
  static AVAILABLE_OPTIONS = [Collection.COMPONENT_NAME]

  /**
   * Execute Install command
   * @param {string} collectionName
   * @param {boolean} watchMode
   * @return {Promise<Awaited<void>[]>}
   */
  static async execute (collectionName, watchMode) {
    const promises = []

    const collection = await InstallCommand.installOne(collectionName)

    if (watchMode) {
      promises.push(this.watch(collection))
    }

    return Promise.all(promises)
  }

  /**
   * Install a Collection
   * @param {string} collectionName
   * @return {Promise<Collection>}
   */
  static async installOne (collectionName) {
    // Creating Theme
    const theme = ThemeFactory.fromThemeInstallCommand()

    // Log & timer
    logger.info(`Building ${collectionName} Collection ...`)
    console.time(`Building "${collectionName}" collection`)

    // Creating Collection and its children
    const collection = await CollectionFactory.fromThemeInstallCommand(collectionName)
    // Build and install Collection
    await CollectionBuilder.build(collection)

    // Log & timer
    logger.info(`${collectionName}: Build Complete`)
    console.timeEnd(`Building "${collectionName}" collection`)

    await CollectionInstaller.install(theme, collection)

    return collection
  }

  static async onCollectionWatchEvent (collectionName, watcher, event, eventPath) {
    const filename = path.basename(eventPath)
    logger.debug(`Watcher Event: "${event}" on file: ${filename} detected`)

    const collection = await InstallCommand.installOne(collectionName)

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
    const watchFolders = CollectionUtils.getWatchFolders(collection)

    const watcher = Watcher.getWatcher(watchFolders)

    const onCollectionWatchEvent = this.onCollectionWatchEvent.bind(null, collection.name, watcher)
    Watcher.watch(watcher, onCollectionWatchEvent)
  }
}

export default InstallCommand
