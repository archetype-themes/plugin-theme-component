// Node imports
import path from 'node:path'

// Archie imports
import BuildCommand from './BuildCommand.js'
import Session from '../../main/models/static/Session.js'
import CollectionInstaller from '../../main/Installers/CollectionInstaller.js'
import CollectionUtils from '../../utils/CollectionUtils.js'
import logger from '../../utils/Logger.js'
import NodeUtils from '../../utils/NodeUtils.js'
import ThemeFactory from '../../main/factory/ThemeFactory.js'
import Timer from '../../utils/Timer.js'
import Watcher from '../../utils/Watcher.js'

class InstallCommand {
  /**
   * Execute Install command
   * @return {Promise<Awaited<void>[]>}
   */
  static async execute () {
    const promises = []

    let collectionsList
    if (NodeUtils.isString(Session.targetComponentName)) {
      collectionsList = {}
      collectionsList[Session.targetComponentName] = []
    } else {
      collectionsList = Session.targetComponentName
    }

    for (const [collectionName, sectionsList] of Object.entries(collectionsList)) {
      const collection = await InstallCommand.installOne(collectionName, sectionsList)

      if (Session.watchMode) {
        promises.push(this.watch(collection))
      }
    }

    return Promise.all(promises)
  }

  /**
   * Install a Collection
   * @param {string} collectionName
   * @param {string[]} sectionNames
   * @return {Promise<module:models/Collection>}
   */
  static async installOne (collectionName, sectionNames) {
    logger.info(`Building & Installing the ${collectionName} Collection.`)
    const startTime = Timer.getTimer()

    // Creating Theme
    const theme = ThemeFactory.fromThemeInstallCommand()

    // Build using the Build Command
    const collection = await BuildCommand.buildCollection(collectionName, sectionNames)

    // Install and time it!
    logger.info(`Installing the ${collectionName} Collection for the ${theme.name} Theme.`)
    const installStartTime = Timer.getTimer()
    await CollectionInstaller.install(theme, collection)
    logger.info(`${collection.name}: Install Complete in ${Timer.getEndTimerInSeconds(installStartTime)} seconds`)
    logger.info(`${collection.name}: Build & Install Completed in ${Timer.getEndTimerInSeconds(startTime)} seconds\n`)
    return Promise.resolve(collection)
  }

  /**
   * On Collection Watch Event
   * @param {string} collectionName
   * @param {string[]} sectionNames
   * @param {FSWatcher} watcher
   * @param event
   * @param eventPath
   * @return {Promise<module: models/Collection>}
   */
  static async onCollectionWatchEvent (collectionName, sectionNames, watcher, event, eventPath) {
    const filename = path.basename(eventPath)
    logger.debug(`Watcher Event: "${event}" on file: ${filename} detected`)

    const collection = await InstallCommand.installOne(collectionName, sectionNames)

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
    const watchFolders = CollectionUtils.getWatchFolders(collection)

    const watcher = Watcher.getWatcher(watchFolders)

    const onCollectionWatchEvent = this.onCollectionWatchEvent.bind(null, collection.name, collection.sectionNames, watcher)
    Watcher.watch(watcher, onCollectionWatchEvent)
  }
}

export default InstallCommand
