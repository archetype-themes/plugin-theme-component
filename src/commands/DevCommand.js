import { basename, join, relative } from 'node:path'
import { DEV_FOLDER_NAME } from '../config/CLI.js'

import Components from '../config/Components.js'
import { fromDevCommand } from '../factory/ThemeFactory.js'
import Session from '../models/static/Session.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import { install, validateExternalLocation } from '../utils/ExternalComponentUtils.js'
import logger, { logChildItem, logSpacer, logTitleItem } from '../utils/Logger.js'
import { exitWithError } from '../utils/NodeUtils.js'
import { ucfirst } from '../utils/SyntaxUtils.js'
import Watcher from '../utils/Watcher.js'
import BuildCommand from './BuildCommand.js'
import CollectionInstaller from './runners/CollectionInstaller.js'
import { spawn } from 'node:child_process'

class DevCommand {
  /**
   * Execute The Dev CLI Command
   * @return {Promise<Awaited<FSWatcher|unknown>[]>}
   */
  static async execute () {
    const collectionName = Session.config.name
    const componentName = Session.targets

    // Initial build
    const collection = await this.exploreComponent(Session.devTheme, collectionName, componentName)

    // Start watcher and shopify theme dev processes
    Session.firstRun = false
    const ignorePatterns = CollectionUtils.getIgnorePatterns(collection)
    const watcherPromise = this.watchComponents(collection.rootFolder, ignorePatterns, Session.devTheme, collection.name, componentName)
    const themeDevPromise = this.runThemeDev(collection.rootFolder)

    return Promise.all([watcherPromise, themeDevPromise])

  }

  /**
   * Explore Components
   * @param {string} devThemeOption
   * @param {string} collectionName
   * @param {string} [componentName]
   * @param {FSWatcher} [watcher] Watcher Instance
   * @param {string} [event] Watcher Event
   * @param {string} [eventPath] Watcher Event Path
   * @returns {Promise<module:models/Collection>}
   */
  static async exploreComponent (devThemeOption, collectionName, componentName, watcher, event, eventPath) {
    if (event && eventPath) {
      const filename = basename(eventPath)
      logSpacer()
      logger.info('--------------------------------------------------------')
      logger.info(`${ucfirst(event)} on ${filename} detected (${eventPath})`)
      logger.info('--------------------------------------------------------')
      logSpacer()
    }

    // Build & Deploy Collection
    const componentNames = componentName && Session.targetType === Components.COMPONENT_TYPE_NAME ? [componentName] : []
    const collection = await BuildCommand.buildCollection(collectionName, componentNames)
    await BuildCommand.deployCollection(collection)

    const devFolder = join(collection.rootFolder, DEV_FOLDER_NAME)

    // Setup A Theme and Create Its Model Instance
    try {
      const validThemeFolder = await validateExternalLocation(devThemeOption, collection.rootFolder)
      await install(validThemeFolder, devFolder, 'Explorer Theme')
    } catch (error) {
      exitWithError('Source Dev Theme Folder or Repository is invalid: ' + error.message)
    }

    const theme = await fromDevCommand(devFolder)

    logTitleItem(`Installing ${Session.targets} Build To ${relative(collection.rootFolder, devFolder)}`)

    await CollectionInstaller.install(theme, collection)

    logChildItem('Install Complete')

    return collection
  }

  /**
   * Watch Collection for changes
   * @param {string} collectionRootFolder
   * @param {string[]} ignorePatterns
   * @param {string} collectionName
   * @param {string} componentName
   * @param {string} devThemeOption
   * @returns {Promise<FSWatcher>}
   */
  static async watchComponents (collectionRootFolder, ignorePatterns, collectionName, componentName, devThemeOption) {
    const watcher = Watcher.getWatcher(collectionRootFolder, ignorePatterns)

    const onCollectionWatchEvent = this.exploreComponent.bind(this, collectionName, componentName, devThemeOption, watcher)
    logSpacer()
    logger.info('--------------------------------------------------------')
    logger.info(`${Session.targets}: Watching component tree for changes`)
    logger.info('(Ctrl+C to abort)')
    logger.info('--------------------------------------------------------')
    logSpacer()
    return Watcher.watch(watcher, onCollectionWatchEvent)
  }

  static async runThemeDev (collectionRootFolder) {
    const cwd = join(collectionRootFolder, DEV_FOLDER_NAME)
    const shopifyThemeDev = spawn('shopify', ['theme', 'dev', '--path', cwd], {
      stdio: 'inherit'
    })

    return new Promise((resolve) => {
      shopifyThemeDev.on('close', code => {
        resolve(code)
      })
    })
  }

}

export default DevCommand
