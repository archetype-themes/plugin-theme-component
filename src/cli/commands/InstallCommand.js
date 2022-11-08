import CollectionBuilder from '../../builders/CollectionBuilder.js'
import CollectionFactory from '../../factory/CollectionFactory.js'
import SectionFactory from '../../factory/SectionFactory.js'
import ThemeFactory from '../../factory/ThemeFactory.js'
import CollectionInstaller from '../../Installers/CollectionInstaller.js'
import Collection from '../../models/Collection.js'
import Theme from '../../models/Theme.js'
import FileUtils from '../../utils/FileUtils.js'
import logger from '../../utils/Logger.js'
import NodeUtils from '../../utils/NodeUtils.js'
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
   * @param {string|Object} collectionNames
   * @param {boolean} watchMode
   * @return {Promise<Awaited<void>[]>}
   */
  static async execute (collectionNames, watchMode) {
    const promises = []

    if (typeof collectionNames === 'object' && Object.keys(collectionNames).length > 0) {
      for (const collectionName in collectionNames) {
        const collection = await InstallCommand.installOne(collectionName)

        if (watchMode) {
          promises.push(this.watch(collection))
        }
      }
    } else if (typeof collectionNames === 'string') {
      const collection = await InstallCommand.installOne(collectionNames)

      if (watchMode) {
        promises.push(this.watch(collection))
      }
    } else {
      throw new Error('No Collection found in Config or on the command line.')
    }
    return Promise.all(promises)
  }

  /**
   * Install a Collection
   * @param {string} collectionName
   * @return {Promise<Collection>}
   */
  static async installOne (collectionName) {
    const theme = ThemeFactory.fromThemeInstallCommand()
    const collection = await CollectionFactory.fromThemeInstallCommand(collectionName)
    collection.sections = await SectionFactory.fromCollection(collection)

    for (const section of collection.sections) {
      if (!await FileUtils.isReadable(section.rootFolder)) {
        const error = new Error(`Section not accessible. Expected location was: "${section.rootFolder}". Collection Install cancelled.`)
        error.name = 'File Access Error'
        NodeUtils.exitWithError(error)
      }
    }
    await CollectionBuilder.build(collection)
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
   * @param {Collection} collection
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
