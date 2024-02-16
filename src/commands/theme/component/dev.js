import { Args, Flags } from '@oclif/core'
import { sessionFactory } from '../../../factory/SessionFactory.js'
import { BaseCommand } from '../../baseCommand.js'
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
import Build from './build.js'
import { install, validateExternalLocation } from '../../../utils/ExternalComponentUtils.js'
import { fromDevCommand } from '../../../factory/ThemeFactory.js'
import CollectionInstaller from '../../../installers/CollectionInstaller.js'

export const COMPONENT_ARG_NAME = 'components'
export const THEME_FLAG_NAME = 'theme-path'
export const LOCALES_FLAG_NAME = 'locales-path'
export const SETUP_FLAG_NAME = 'setup-files'
export const WATCH_FLAG_NAME = 'watch'

export default class Dev extends BaseCommand {
  static description = 'Develop theme components'

  static args = {
    [COMPONENT_ARG_NAME]: Args.string({
      description: 'Component name(s)'
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

  static strict = false

  async run () {
    const { argv, flags, metadata } = await this.parse(Dev)

    const commandElements = this.id.split(':')
    Session.command = commandElements[commandElements.length - 1]

    const tomlConfig = await getTomlConfig()

    // Init Session
    sessionFactory(this.id, tomlConfig)
    Dev.setSessionArgs(argv, tomlConfig)
    await Dev.setSessionFlags(flags, metadata, tomlConfig)

    const collectionName = getCurrentWorkingDirectoryName()

    // No watch flag, running once and returning
    if (!Session.watchMode) {
      return Promise.resolve(Dev.exploreComponent(Session.themePath, collectionName, Session.component))
    }

    const collection = await Dev.exploreComponent(Session.themePath, collectionName, Session.component)

    // Start watcher and shopify theme dev processes
    Session.firstRun = false
    const ignorePatterns = CollectionUtils.getIgnorePatterns(collection)
    const watcherPromise = Dev.watchComponents(collection.rootFolder, ignorePatterns, Session.themePath, collection.name, Session.component)
    if (Session.syncMode) {
      const themeDevPromise = Dev.runThemeDev(join(collection.rootFolder, DEV_FOLDER_NAME))
      return Promise.all([watcherPromise, themeDevPromise])
    }

    return Promise.resolve(watcherPromise)
  }

  /**
   * Explore Components
   * @param {string} themePath
   * @param {string} collectionName
   * @param {string[]} [componentNames]
   * @param {string} [event] Watcher Event
   * @param {string} [eventPath] Watcher Event Path
   * @returns {Promise<module:models/Collection>}
   */
  static async exploreComponent (themePath, collectionName, componentNames, event, eventPath) {
    if (event && eventPath) {
      Watcher.logEvent(event, eventPath)
    }

    // Build & Deploy Collection
    const collection = await CollectionFactory.fromName(collectionName, componentNames)
    await Build.buildCollection(collection)
    await Build.deployCollection(collection)

    const devFolder = join(collection.rootFolder, DEV_FOLDER_NAME)

    // Setup A Theme and Create Its Model Instance
    try {
      const validThemeFolder = await validateExternalLocation(themePath, collection.rootFolder)
      await install(validThemeFolder, devFolder, 'Explorer Theme')
    } catch (error) {
      exitWithError('Source Dev Theme Folder or Repository is invalid: ' + error.message)
    }

    const theme = await fromDevCommand(devFolder)

    logTitleItem(`Installing ${collection.name} Build To ${relative(collection.rootFolder, devFolder)}`)

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

  static setSessionArgs (args, tomlConfig) {
    Session.callerType = Components.COLLECTION_TYPE_NAME
    Session.targetType = Components.COMPONENT_TYPE_NAME

    if (args.length)
      Session.component = args
    else if (Object.hasOwn(tomlConfig, COMPONENT_ARG_NAME))
      Session.component = typeof tomlConfig[COMPONENT_ARG_NAME] === 'string' ?
        [tomlConfig[COMPONENT_ARG_NAME]] : tomlConfig[COMPONENT_ARG_NAME]
  }

  static async setSessionFlags (flags, metadata, tomlConfig) {
    let themePath
    if (metadata.flags[THEME_FLAG_NAME]?.setFromDefault && Object.hasOwn(tomlConfig, THEME_FLAG_NAME)) {
      themePath = tomlConfig[THEME_FLAG_NAME]
    } else {
      themePath = flags[THEME_FLAG_NAME]
    }

    Session.themePath = isRepoUrl(themePath) ? themePath : await getAbsolutePath(themePath)

    let localesPath
    if (metadata.flags[LOCALES_FLAG_NAME]?.setFromDefault && Object.hasOwn(tomlConfig, LOCALES_FLAG_NAME)) {
      localesPath = tomlConfig[LOCALES_FLAG_NAME]
    } else {
      localesPath = flags[LOCALES_FLAG_NAME]
    }

    Session.localesPath = isRepoUrl(localesPath) ? localesPath : await getAbsolutePath(localesPath)

    if (metadata.flags[SETUP_FLAG_NAME]?.setFromDefault && Object.hasOwn(tomlConfig, SETUP_FLAG_NAME)) {
      Session.setupFiles = tomlConfig[SETUP_FLAG_NAME]
    } else {
      Session.setupFiles = flags[SETUP_FLAG_NAME]
    }

    if (metadata.flags[WATCH_FLAG_NAME]?.setFromDefault && Object.hasOwn(tomlConfig, WATCH_FLAG_NAME)) {
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
   * @param {string} themePath
   * @returns {Promise<FSWatcher>}
   */
  static async watchComponents (collectionRootFolder, ignorePatterns, collectionName, componentName, themePath) {
    const watcher = Watcher.getWatcher(collectionRootFolder, ignorePatterns)

    const onCollectionWatchEvent = this.exploreComponent.bind(this, collectionName, componentName, themePath, watcher)
    logSpacer()
    logger.info('--------------------------------------------------------')
    logger.info(`${collectionName}: Watching component tree for changes`)
    logger.info('(Ctrl+C to abort)')
    logger.info('--------------------------------------------------------')
    logSpacer()

    return Watcher.watch(watcher, onCollectionWatchEvent)
  }
}

