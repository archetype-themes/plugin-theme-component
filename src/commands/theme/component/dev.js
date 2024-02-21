import { Args, Flags } from '@oclif/core'
import { sessionFactory } from '../../../factory/SessionFactory.js'
import { BaseCommand } from '../../baseCommand.js'
import Session from '../../../models/static/Session.js'
import Components from '../../../config/Components.js'
import { getTomlConfig } from '../../../utils/TomlUtils.js'
import { exitWithError, getCurrentWorkingDirectoryName } from '../../../utils/NodeUtils.js'
import { join, relative } from 'node:path'
import { DEV_FOLDER_NAME } from '../../../config/CLI.js'
import { logChildItem, logTitleItem, logWatcherEvent, logWatcherInit } from '../../../utils/LoggerUtils.js'
import { spawn } from 'node:child_process'
import CollectionFactory from '../../../factory/CollectionFactory.js'
import Build from './build.js'
import { install, validateLocation } from '../../../utils/ExternalComponentUtils.js'
import { fromDevCommand } from '../../../factory/ThemeFactory.js'
import CollectionInstaller from '../../../installers/CollectionInstaller.js'
import { isRepoUrl } from '../../../utils/WebUtils.js'
import { copy, getAbsolutePath } from '../../../utils/FileUtils.js'
import { getIgnorePatterns, getWatcher, watch } from '../../../utils/Watcher.js'

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
    const promises = []
    const logInitLines = []

    // Watch Local Component Collection
    promises.push(Dev.watchComponents(collection.rootFolder, getIgnorePatterns(collection.rootFolder), Session.themePath, collection.name, Session.component))
    logInitLines.push(`${collectionName}: Watching component tree for changes`)

    // Watch Local Theme
    if (!isRepoUrl(Session.themePath)) {
      promises.push(Dev.watchTheme(Session.themePath, getIgnorePatterns(Session.themePath), collection.rootFolder, collection.name, Session.component))
      logInitLines.push(`${collectionName}: Watching theme folder for changes`)
    }

    // Watch Local Locales
    if (!isRepoUrl(Session.localesPath)) {
      promises.push(Dev.watchLocales(Session.localesPath, Session.themePath, collection.name, Session.component))
      logInitLines.push(`${collectionName}: Watching locales folder for changes`)
    }

    // Run "shopify theme dev" -- unused at the moment due to config challenges
    if (Session.syncMode) {
      promises.push(Dev.runThemeDev(join(collection.rootFolder, DEV_FOLDER_NAME)))
      logInitLines.push('${collectionName}: Starting `shopify theme dev` process in parallel')
    }

    logWatcherInit(logInitLines)

    return Promise.all(promises)
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
      logWatcherEvent(event, eventPath)
    }

    // Build & Deploy Collection
    const collection = await CollectionFactory.fromName(collectionName, componentNames)
    await Build.buildCollection(collection)
    await Build.deployCollection(collection)

    const devFolder = join(collection.rootFolder, DEV_FOLDER_NAME)

    // Setup A Theme and Create Its Model Instance
    try {
      const validThemeFolder = await validateLocation(themePath, collection.rootFolder)
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
   * @param {string} collectionPath
   * @param {string[]} ignorePatterns
   * @param {string} collectionName
   * @param {string} componentName
   * @param {string} themePath
   * @returns {Promise<FSWatcher>}
   */
  static async watchComponents (collectionPath, ignorePatterns, themePath, collectionName, componentName) {
    const watcher = getWatcher(collectionPath, ignorePatterns)
    const onCollectionWatchEvent = this.exploreComponent.bind(this, themePath, collectionName, componentName)

    return watch(watcher, onCollectionWatchEvent)
  }

  /**
   *
   * @param {string} localesPath
   * @param {string} collectionName
   * @param {string[]} componentNames
   * @param {string} themePath
   * @return {Promise<FSWatcher>}
   */
  static async watchLocales (localesPath, themePath, collectionName, componentNames) {
    const watchGlobExpression = join(localesPath, '**/*.json')

    const watcher = getWatcher(watchGlobExpression)
    const onLocalesWatchEvent = this.exploreComponent.bind(this, themePath, collectionName, componentNames)

    return watch(watcher, onLocalesWatchEvent)
  }

  static async watchTheme (themePath, ignorePatterns, collectionRootFolder, collectionName, componentNames) {
    const watcher = getWatcher(themePath, ignorePatterns)
    const onThemeWatchEvent = this.copyThemeFile.bind(this, themePath, watcher)

    return watch(watcher, onThemeWatchEvent)
  }

  /**
   *
   * @param {string} themePath
   * @param {FSWatcher} [watcher] Watcher Instance
   * @param {string} [event] Watcher Event
   * @param {string} [eventPath] Watcher Event Path
   * @return {Promise<Awaited<Promise<Awaited<void>[]>>>}
   */
  static copyThemeFile (themePath, watcher, event, eventPath) {
    return Promise.resolve(copy({}))
  }
}

