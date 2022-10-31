import CollectionFactory from '../factory/CollectionFactory.js'
import CollectionBuilder from '../builders/CollectionBuilder.js'
import CollectionInstaller from '../Installers/CollectionInstaller.js'
import ArchieComponents from '../config/ArchieComponents.js'
import CollectionWatcher from '../watchers/CollectionWatcher.js'
import logger from '../utils/Logger.js'
import SectionFactory from '../factory/SectionFactory.js'
import FileUtils from '../utils/FileUtils.js'
import NodeUtils from '../utils/NodeUtils.js'
import section from '../models/Section.js'

class Install {
// Install Command
  static INSTALL_COMMAND_NAME = 'install'
  static INSTALL_COMMAND_ALLOWED_COMPONENTS = [ArchieComponents.THEME_COMPONENT_TYPE]
  static INSTALL_COMMAND_OPTIONS = [ArchieComponents.COLLECTION_COMPONENT_TYPE]

  /**
   * Execute Install command
   * @param {Theme} theme
   * @param {string|Object} collectionNames
   * @param {boolean} watchMode
   * @return {Promise<Awaited<Collection>[]>}
   */
  static async execute (theme, collectionNames, watchMode) {
    const promises = []
    if (typeof collectionNames === 'object') {
      for (const collectionName in collectionNames) {
        const collection = await Install.installOne(theme, collectionName)

        if (watchMode) {
          promises.push(this.watch(theme, collection))
        }
      }
    } else if (typeof collectionNames === 'string') {
      const collection = await Install.installOne(theme, collectionNames)

      if (watchMode) {
        promises.push(this.watch(theme, collection))
      }
    }
    return Promise.all(promises)
  }

  /**
   * Install a Collection
   * @param {Theme} theme
   * @param {string} collectionName
   * @return {Promise<Collection>}
   */
  static async installOne (theme, collectionName) {
    const collection = await CollectionFactory.fromThemeInstallCommand(collectionName)

    if (!await FileUtils.isReadable(collection.rootFolder)) {
      const error = new Error(`Collection not accessible. Expected location was: "${collection.rootFolder}". Collection Install cancelled.`)
      error.name = 'File Access Error'
      NodeUtils.exitWithError(error)
    }

    collection.sections = await SectionFactory.fromCollection(collection)

    for (section of collection.sections) {
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

  /**
   * Build and Install Collection in Current Theme on File Change
   * @param {Theme} theme
   * @param {Collection} collection
   * @return {Promise<Collection>}
   */
  static async watch (theme, collection) {
    const watcher = CollectionWatcher.getChokidarCollectionWatcher(collection.rootFolder)

    watcher.on('all', async (event, path) => {
      logger.debug(`Event: "${event}" on file: ${path} detected`)
      return Install.installOne(theme, collection.name)
    })

  }
}

export default Install
