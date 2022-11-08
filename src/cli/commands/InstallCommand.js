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
   * @return {Promise<Awaited<Collection>[]>}
   */
  static async execute (collectionNames, watchMode) {
    const promises = []

    if (typeof collectionNames === 'object') {
      for (const collectionName in collectionNames) {
        const collection = await InstallCommand.installOne(collectionName)

        if (watchMode) {
          promises.push(this.watch(collection.name, collection.rootFolder))
        }
      }
    } else if (typeof collectionNames === 'string') {
      const collection = await InstallCommand.installOne(collectionNames)

      if (watchMode) {
        promises.push(this.watch(collection.name, collection.rootFolder))
      }
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

  static async onCollectionWatchEvent (collectionName, event, path) {
    logger.debug(`Watcher Event: "${event}" on file: ${path} detected`)
    return InstallCommand.installOne(collectionName)
  }

  /**
   * Build and Install Collection in Current Theme on File Change
   * @param {string} collectionName
   * @param {string} collectionRootFolder
   * @return {Promise<Collection>}
   */
  static async watch (collectionName, collectionRootFolder) {
    const onCollectionWatchEvent = this.onCollectionWatchEvent.bind(null, collectionName)
    Watcher.watch(['sections/*/src/*', 'snippets/*/src/*'], onCollectionWatchEvent, collectionRootFolder)
  }
}

export default InstallCommand
