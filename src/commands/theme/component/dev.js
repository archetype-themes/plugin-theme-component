import { Args, Flags } from '@oclif/core'
import { sessionFactory } from '../../../factory/SessionFactory.js'
import { BaseCommand } from '../../../../plugin/baseCommand.js'
import Session from '../../../models/static/Session.js'
import Components from '../../../config/Components.js'
import { getTomlConfig } from '../../../utils/TomlUtils.js'
import { exitWithError, getCurrentWorkingDirectory } from '../../../utils/NodeUtils.js'
import CollectionUtils from '../../../utils/CollectionUtils.js'
import { join, relative } from 'node:path'
import { DEV_FOLDER_NAME } from '../../../config/CLI.js'
import Watcher from '../../../utils/Watcher.js'
import logger, { logChildItem, logSpacer, logTitleItem } from '../../../utils/Logger.js'
import { spawn } from 'node:child_process'
import CollectionFactory from '../../../factory/CollectionFactory.js'
import BuildCommand from '../../BuildCommand.js'
import { install, validateExternalLocation } from '../../../utils/ExternalComponentUtils.js'
import { fromDevCommand } from '../../../factory/ThemeFactory.js'
import CollectionInstaller from '../../runners/CollectionInstaller.js'

export const THEME_FLAG_NAME = 'theme-path'
export const LOCALES_FLAG_NAME = 'locales-path'
export const SETUP_FLAG_NAME = 'setup-files'
export const WATCH_FLAG_NAME = 'watch'

export default class Dev extends BaseCommand {
  static description = 'Develop components in isolation or altogether in a components explorer environment or within a full featured theme.'

  static args = {
    component: Args.string({
      description: 'Name of the component to develop'
    })
  }

  static flags = {
    [LOCALES_FLAG_NAME]: Flags.string({
      summary: 'Path to your locales data',
      description: 'The path to your locales data should point to a GitHub URL or an absolute path on your local machine. The default value points to Archetype Themes\' publicly shared locales database.',
      helpGroup: 'Path',
      helpValue: '<path-or-github-url>',
      char: 'l',
      default: 'https://github.com/archetype-themes/locales.git',
      defaultHelp: 'Path to the publicly shared locales repository form Archetype Themes'
    }),
    [THEME_FLAG_NAME]: Flags.string({
      summary: 'Path to your theme',
      description: 'The path to your theme should point to a GitHub URL or an absolute path on your local machine. The default value points to Archetype Themes\' publicly shared component explorer theme.',
      helpGroup: 'Path',
      helpValue: '<path-or-github-url>',
      char: 't',
      default: 'https://github.com/archetype-themes/explorer.git',

    }),
    [SETUP_FLAG_NAME]: Flags.boolean({
      summary: 'Copy Setup Files',
      description: 'Active by default, this option will copy component setup files in your theme to allow you to explore that component in an isolated environment.',
      char: 's',
      default: true,
      allowNo: true
    }),
    [WATCH_FLAG_NAME]: Flags.boolean({
      summary: 'Watch For Changes',
      description: 'Active by default, this option will trigger a component build on file change. It will also refresh your theme fiels and locale files when changes to local files are detected.',
      char: 'w',
      default: true,
      allowNo: true
    })
  }

  async run () {
    const { args, flags, metadata } = await this.parse(Dev)

    const commandElements = this.id.split(':')
    Session.command = commandElements[commandElements.length - 1]

    const tomlConfig = await getTomlConfig()

    sessionFactory(this.id, tomlConfig)
    Dev.setSessionTargets(args, tomlConfig)
    Dev.setSessionFlags(flags, metadata, tomlConfig)

    const collectionName = getCurrentWorkingDirectory()

    if (!Session.watchMode) {
      return Promise.resolve(Dev.exploreComponent(Session.devTheme, collectionName, Session.targets))
    }

    const collection = await Dev.exploreComponent(Session.devTheme, collectionName, Session.targets)

    // Start watcher and shopify theme dev processes
    Session.firstRun = false
    const ignorePatterns = CollectionUtils.getIgnorePatterns(collection)
    const watcherPromise = Dev.watchComponents(collection.rootFolder, ignorePatterns, Session.devTheme, collection.name, Session.targets)
    if (Session.syncMode) {
      const themeDevPromise = Dev.runThemeDev(join(collection.rootFolder, DEV_FOLDER_NAME))
      return Promise.all([watcherPromise, themeDevPromise])
    }

    return Promise.resolve(watcherPromise)
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
      Watcher.logEvent(event, eventPath)
    }

    // Build & Deploy Collection
    const componentNames = componentName && Session.targetType === Components.COMPONENT_TYPE_NAME ? [componentName] : []
    const collection = await CollectionFactory.fromName(collectionName, componentNames)
    await BuildCommand.buildCollection(collection)
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

  static async runThemeDev (cwd) {
    const shopifyThemeDev = spawn('shopify', ['theme', 'dev', '--path', cwd], {
      stdio: 'inherit'
    })

    // Listen for the 'exit' event on the parent process
    process.on('exit', () => {
      // Check if the child process is still running
      if (shopifyThemeDev && !shopifyThemeDev.killed) {
        // Terminate the child process
        shopifyThemeDev.kill()
      }
    })

    // Make sure to kill shopify cli
    process.on('uncaughtException', () => {
      // Check if the child process is still running
      if (shopifyThemeDev && !shopifyThemeDev.killed) {
        // Terminate the child process
        shopifyThemeDev.kill()
      }

      // Exit the program
      process.exit(1)
    })

    return new Promise((resolve) => {
      shopifyThemeDev.on('close', code => {
        resolve(code)
      })
    })
  }

  static setSessionTargets (args, tomlConfig) {
    Session.callerType = Components.COLLECTION_TYPE_NAME
    Session.targetType = Components.COMPONENT_TYPE_NAME

    if (args.component)
      Session.targets = args.component
    else if (tomlConfig.component)
      Session.targets = tomlConfig.component
  }

  static setSessionFlags (flags, metadata, tomlConfig) {
    if (metadata.flags[THEME_FLAG_NAME]?.setFromDefault && tomlConfig[THEME_FLAG_NAME]) {
      Session.devTheme = tomlConfig[THEME_FLAG_NAME]
    } else {
      Session.devTheme = flags[THEME_FLAG_NAME]
    }

    if (metadata.flags[LOCALES_FLAG_NAME]?.setFromDefault && tomlConfig[LOCALES_FLAG_NAME]) {
      Session.localesRepo = tomlConfig[LOCALES_FLAG_NAME]
    } else {
      Session.localesRepo = flags[LOCALES_FLAG_NAME]
    }

    if (metadata.flags[SETUP_FLAG_NAME]?.setFromDefault && tomlConfig[SETUP_FLAG_NAME]) {
      Session.setupFiles = tomlConfig[SETUP_FLAG_NAME]
    } else {
      Session.setupFiles = flags[SETUP_FLAG_NAME]
    }

    if (metadata.flags[WATCH_FLAG_NAME]?.setFromDefault && tomlConfig[WATCH_FLAG_NAME]) {
      Session.watchMode = tomlConfig[WATCH_FLAG_NAME]
    } else {
      Session.watchMode = flags[WATCH_FLAG_NAME]
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

