import { BaseCommand } from '../../baseCommand.js'
import { getTomlConfig } from '../../../utils/TomlUtils.js'
import { sessionFactory } from '../../../factory/SessionFactory.js'
import ThemeFactory from '../../../factory/ThemeFactory.js'
import Session from '../../../models/static/Session.js'
import CollectionFactory from '../../../factory/CollectionFactory.js'
import { isRepoUrl } from '../../../utils/WebUtils.js'
import { install } from '../../../utils/ExternalComponentUtils.js'
import CollectionUtils from '../../../utils/CollectionUtils.js'
import logger from '../../../utils/Logger.js'
import Dev from './dev.js'
import Build from './build.js'
import CollectionInstaller from '../../../installers/CollectionInstaller.js'
import { getIgnorePatterns, getWatcher, watch } from '../../../utils/Watcher.js'
import { basename } from 'node:path'
import Timer from '../../../models/Timer.js'
import { logWatcherInit } from '../../../utils/LoggerUtils.js'

export default class Install extends BaseCommand {
  static description = 'Install a collection of components'

  async run () {
    const tomlConfig = await getTomlConfig()
    sessionFactory(this.id, tomlConfig)

    const promises = []

    // Creating Theme
    const theme = ThemeFactory.fromThemeInstallCommand()

    for (const collectionEntry of Object.entries(Session.collections)) {
      let collection = await CollectionFactory.fromTomlEntry(collectionEntry)

      // Install it locally if the source is a URL
      if (isRepoUrl(collection.source)) {
        await install(collection.source, collection.rootFolder, collection.name)
      }

      collection = await CollectionUtils.initCollectionFiles(collection)

      await Install.installOne(theme, collection)

      if (Session.watchMode) {
        if (isRepoUrl(collectionEntry[1].source)) {
          logger.error(`Ignoring "${collection.name}": Unable To Watch Collection from a remote URL`)
        } else {
          promises.push(this.watch(collection))
        }
      }
    }
    Session.firstRun = false

    if (promises.length && Session.syncMode) {
      promises.push(Dev.runThemeDev(theme.rootFolder))
    }

    return Promise.all(promises)
  }

  /**
   * Install a Collection
   * @param {import('../../models/Theme.js').default} theme
   * @param {module:models/Collection} collection
   * @return {Promise<module:models/Collection>}
   */
  static async installOne (theme, collection) {
    logger.info(`Building & Installing the ${collection.name} Collection.`)
    const startTime = new Timer()

    // Build using the Build Command
    await Build.buildCollection(collection)
    await Build.deployCollection(collection)
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
   * @param {string} collectionSource
   * @param {FSWatcher} watcher
   * @param event
   * @param eventPath
   * @return {Promise<module: models/Collection>}
   */
  static async onCollectionWatchEvent (collectionName, componentNames, collectionSource, watcher, event, eventPath) {
    const filename = basename(eventPath)
    logger.debug(`Watcher Event: "${event}" on file: ${filename} detected`)

    const theme = ThemeFactory.fromThemeInstallCommand()
    const collection = await CollectionFactory.fromName(collectionName, componentNames, collectionSource)
    await Install.installOne(theme, collection)

    // The Watcher is restarted on any liquid file change.
    // This is useful if any render tags were added or removed, it will reset snippet watched folders.
    if (filename.endsWith('.liquid')) {
      await watcher.close()
      return Install.watch(collection)
    }
  }

  /**
   * Build and Install Collection in Current Theme on File Change
   * @param {module:models/Collection} collection
   * @return {Promise<module: models/Collection>}
   */
  static async watch (collection) {
    const watcher = getWatcher(collection.rootFolder, getIgnorePatterns(collection.rootFolder))
    const onCollectionWatchEvent = Install.onCollectionWatchEvent.bind(null, collection.name, collection.componentNames, collection.source, watcher)

    logWatcherInit(`${collection.name}: Watching component tree for changes`)
    watch(watcher, onCollectionWatchEvent)
  }
}
