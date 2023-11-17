import * as childProcess from 'child_process'
import { basename, join } from 'node:path'
import { DEV_DEFAULT_THEME, DEV_FOLDER_NAME } from '../config/CLI.js'

import Components from '../config/Components.js'
import { fromDevCommand } from '../factory/ThemeFactory.js'
import Session from '../models/static/Session.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import FileUtils from '../utils/FileUtils.js'
import logger, { logChildItem, logSpacer, logTitleItem } from '../utils/Logger.js'
import NodeUtils from '../utils/NodeUtils.js'
import { ucfirst } from '../utils/SyntaxUtils.js'
import Watcher from '../utils/Watcher.js'
import { isRepoUrl } from '../utils/WebUtils.js'
import BuildCommand from './BuildCommand.js'
import CollectionInstaller from './runners/CollectionInstaller.js'

class DevCommand {
  /**
   * Execute The Dev CLI Command
   * @returns {Promise<FSWatcher>}
   */
  static async execute () {
    const devThemeOption = Session.devTheme ? Session.devTheme : DEV_DEFAULT_THEME
    const collectionName = NodeUtils.getPackageName()
    const componentName = Session.targets

    const collection = await this.exploreComponent(devThemeOption, collectionName, componentName)
    const ignorePatterns = CollectionUtils.getIgnorePatterns(collection)
    return this.watchComponents(collection.rootFolder, ignorePatterns, devThemeOption, collection.name, componentName)
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
    await this.themeSetup(devThemeOption, devFolder)
    const theme = await fromDevCommand(devFolder)

    logTitleItem(`Installing ${Session.targets} Build To ${theme.name} Dev Theme`)

    await CollectionInstaller.install(theme, collection)

    logChildItem('Install Complete')

    return collection
  }

  static async themeSetup (devThemeOption, devFolder) {
    logTitleItem('Searching For An Existing Dev Theme Setup')
    if (!await FileUtils.exists(devFolder)) {
      if (isRepoUrl(devThemeOption)) {
        logChildItem('No Dev Theme Found; Starting Download')
        childProcess.execSync(`git clone ${devThemeOption} ${DEV_FOLDER_NAME} --quiet`)
        logChildItem('Download Complete')
      } else {
        logChildItem('No Dev Theme Found, starting copy from local folder')
        await FileUtils.copyFolder(devThemeOption, devFolder, { recursive: true })
        logChildItem('Copy Finished')
      }
    } else {
      if (await FileUtils.exists(join(devFolder, '.git'))) {
        logChildItem('Dev Theme Found: Starting Cleanup & Update')

        // Restores modified files to their original version
        childProcess.execSync('git restore . --quiet', { cwd: devFolder })
        // Cleans untracked files
        childProcess.execSync('git clean -f -d --quiet', { cwd: devFolder })
        // Pull updates if any
        childProcess.execSync('git pull --quiet', { cwd: devFolder })

        logChildItem('Dev Theme Cleanup & Update Complete')
      } else {
        logChildItem('Dev Theme Found: It does not seem to be a git repository. Unable to clean or update.')
        logger.warn('Delete the ".explorer" folder and restart the Dev process to fetch a new copy from source.')
      }
    }
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
}

export default DevCommand
