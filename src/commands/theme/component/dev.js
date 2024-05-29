// External Dependencies
import { spawn } from 'node:child_process'
import { basename, join, relative } from 'node:path'
import { cwd } from 'node:process'
import { Args, Flags } from '@oclif/core'

// Internal Dependencies
import { collectionBuildFactory } from '../../../factory/collectionBuildFactory.js'
import { BaseCommand, COMPONENT_ARG_NAME, LOCALES_FLAG_NAME } from '../../../config/baseCommand.js'
import {
  ASSETS_FOLDER_NAME,
  COLLECTION_TYPE_NAME,
  DEV_FOLDER_NAME,
  SNIPPETS_FOLDER_NAME,
  THEME_INDEX_TEMPLATE_LIQUID_FILE,
  THEME_LAYOUT_FILE
} from '../../../config/constants.js'
import { collectionFactory } from '../../../factory/collectionFactory.js'
import { themeFactory } from '../../../factory/themeFactory.js'
import { injectAssetReferences, installCollection } from '../../../installers/collectionInstaller.js'
import Session from '../../../models/static/Session.js'
import { install } from '../../../utils/externalComponents.js'
import { logChildItem, logTitleItem, logWatcherEvent, logWatcherInit, warn } from '../../../utils/logger.js'
import {
  getValuesFromArgvOrToml,
  getValueFromFlagOrToml,
  getPathFromFlagOrTomlValue
} from '../../../utils/sessionUtils.js'
import {
  ChangeType,
  getChangeTypeFromFilename,
  getIgnorePatterns,
  getWatcher,
  handleWatcherEvent,
  watch
} from '../../../utils/Watcher.js'
import { isGitHubUrl } from '../../../utils/gitUtils.js'
import { installSetupFiles, handleSetupFileWatcherEvent, buildIndexTemplate } from '../../../utils/setupFilesUtils.js'
import { getCurrentTime } from '../../../utils/dateUtils.js'
import { rm } from 'node:fs/promises'
import { exists, saveFile } from '../../../utils/fileUtils.js'
import { getCLIRootFolderName } from '../../../utils/nodeUtils.js'
import Timer from '../../../models/Timer.js'
import { displayComponentTree } from '../../../utils/collectionUtils.js'
import { collectionBuilder } from '../../../builders/collectionBuilder.js'

/** @type {string} **/
export const THEME_FLAG_NAME = 'theme-path'
/** @type {string} **/
export const SETUP_FLAG_NAME = 'setup-files'
/** @type {string} **/
export const WATCH_FLAG_NAME = 'watch'

const THEME_SYNC_FLAG_NAME = 'sync'

export default class Dev extends BaseCommand {
  static description = 'Develop using theme components'

  static args = {
    [COMPONENT_ARG_NAME]: Args.string({
      description: 'Component name(s)'
    })
  }

  static flags = {
    [THEME_FLAG_NAME]: Flags.string({
      summary: 'Path to your theme',
      description:
        "The path to your theme should point to a GitHub URL or a local path. This defaults to Archetype Themes' publicly shared component explorer theme.",
      helpGroup: 'Path',
      helpValue: '<path-or-github-url>',
      char: 't',
      default: 'https://github.com/archetype-themes/reference-theme.git'
    }),
    [LOCALES_FLAG_NAME]: Flags.string({
      summary: 'Path to your locales data',
      description:
        "The path to your locales data should point to a GitHub URL or a local path. This defaults to Archetype Themes' publicly shared locales database.",
      helpGroup: 'Path',
      helpValue: '<path-or-github-url>',
      char: 'l',
      default: 'https://github.com/archetype-themes/locales.git',
      defaultHelp: 'Path to the publicly shared locales repository form Archetype Themes'
    }),
    [SETUP_FLAG_NAME]: Flags.boolean({
      summary: 'Copy Setup Files',
      description:
        'Installs component setup files in your dev theme to allow component exploration in an isolated environment.',
      char: 's',
      default: true,
      allowNo: true
    }),
    [WATCH_FLAG_NAME]: Flags.boolean({
      summary: 'Watch For Changes',
      description:
        'Any changes to component, locale of theme source files triggers a file copy and theme build if necessary.',
      char: 'w',
      default: true,
      allowNo: true
    }),
    [THEME_SYNC_FLAG_NAME]: Flags.boolean({
      summary: 'Sync your files through shopify theme dev',
      description:
        'This will execute shopify theme dev along with your component dev command. You can customize options for that command in your toml file.',
      default: true,
      allowNo: true
    })
  }

  // Enables limitless args entry
  static strict = false

  /**
   * Run theme:component:dev command
   * @returns {Promise<Awaited<unknown>[]|Collection|module:models/Collection|void>}
   */
  async run() {
    const { argv, flags, metadata } = await this.parse(Dev)
    BaseCommand.setLogLevel(flags)
    const tomlConfig = await super.run()

    await Dev.setSessionValues(argv, flags, metadata, tomlConfig)

    const collection = await Dev.exploreComponent(Session.themePath, Session.components)

    if (Session.firstRun && Session.setupFiles) {
      const installFolder = join(collection.rootFolder, DEV_FOLDER_NAME)
      await installSetupFiles(collection.components, installFolder)
    }

    // No watch flag, running once and returning
    if (!Session.watchMode) {
      return collection
    }

    // Start watcher and shopify theme dev processes
    Session.firstRun = false
    const promises = []
    const logInitLines = []

    // Watch Local Component Collection
    promises.push(
      Dev.watchComponents(
        collection.rootFolder,
        getIgnorePatterns(collection.rootFolder),
        Session.themePath,
        Session.components
      )
    )

    logInitLines.push(`${collection.name}: Watching component tree for changes`)

    // Watch Local Theme
    if (!isGitHubUrl(Session.themePath)) {
      // Get default ignore patterns with .gitignore entries
      /** @type {(string|RegExp)[]} **/
      const ignorePatterns = getIgnorePatterns(Session.themePath)
      // Ignore all component snippet liquid files
      ignorePatterns.push(
        ...collection.allComponents.map((component) => join(SNIPPETS_FOLDER_NAME, `${component.name}.liquid`))
      )
      // Ignore all component static asset files
      ignorePatterns.push(
        ...collection.allComponents
          .map((component) =>
            component.files.assetFiles.map((assetFile) => join(ASSETS_FOLDER_NAME, basename(assetFile)))
          )
          .flat()
      )
      // Ignore all storefront locale files
      ignorePatterns.push(/(^|[/\\])locales(?!.*schema\.json$).*\.json$/)
      promises.push(Dev.watchTheme(Session.themePath, ignorePatterns, collection.rootFolder, Session.components))
      logInitLines.push(`${collection.name}: Watching theme folder for changes`)
    }

    // Watch Local Locales
    if (!isGitHubUrl(Session.localesPath)) {
      promises.push(Dev.watchLocales(Session.localesPath, Session.themePath, Session.components))
      logInitLines.push(`${collection.name}: Watching locales folder for changes`)
    }

    // Run "shopify theme dev" -- unused at the moment due to config challenges
    if (Session.syncMode) {
      promises.push(Dev.runThemeDev(join(collection.rootFolder, DEV_FOLDER_NAME)))
      logInitLines.push(`${collection.name}: Starting \`shopify theme dev\` process in parallel`)
    }

    logWatcherInit(logInitLines)

    return Promise.all(promises)
  }

  /**
   * Explore Components
   * @param {string} themePath
   * @param {string[]} [componentNames]
   * @param {string} [event] Watcher Event
   * @param {string} [eventPath] Watcher Event Path
   * @returns {Promise<module:models/Collection|void>}
   */
  static async exploreComponent(themePath, componentNames, event, eventPath) {
    // Setup A Theme and Create Its Model Instance
    const devFolder = join(cwd(), DEV_FOLDER_NAME)

    if (Session.firstRun) {
      // Start with a clean slate
      if (await exists(devFolder)) {
        await rm(devFolder, { recursive: true })
      }

      await this.installDependencies(themePath, devFolder)
    }

    if (event && eventPath) {
      logWatcherEvent(event, eventPath)
      Session.changeType = getChangeTypeFromFilename(eventPath)
      if (Session.changeType === ChangeType.SetupFiles) {
        await handleSetupFileWatcherEvent(cwd(), devFolder, event, eventPath)
      }
    }

    // Build & Deploy Collection
    let collection = await this.getCollectionFromCwd(componentNames)
    if (Session.firstRun) {
      displayComponentTree(collection)
    }
    collection = await collectionBuilder(collection)

    const theme = await themeFactory(devFolder)

    logTitleItem(`Installing ${collection.name} Build To ${relative(collection.rootFolder, devFolder)}`)

    await installCollection(theme, collection)

    if (
      Session.setupFiles &&
      (Session.firstRun || [ChangeType.Liquid, ChangeType.SetupFiles].includes(Session.changeType))
    ) {
      const indexTemplate = await buildIndexTemplate(collection.components, theme.rootFolder)
      await saveFile(join(devFolder, THEME_INDEX_TEMPLATE_LIQUID_FILE), indexTemplate)
    }

    logChildItem(`Install Complete at ${getCurrentTime()}`)

    return collection
  }

  /**
   * Install Dependencies
   * @param {string} themePath
   * @param {string} devFolder
   * @return {Promise<void>}
   */
  static async installDependencies(themePath, devFolder) {
    logTitleItem('Installing Dependencies')
    // Install Theme Files
    const timer = new Timer()
    logChildItem(`Installing Theme Files From ${basename(themePath, '.git')}`)
    await install(themePath, devFolder)
    logChildItem(`Done (${timer.now()} seconds)`)

    // Download Locales
    if (isGitHubUrl(Session.localesPath)) {
      const timer = new Timer()
      logChildItem(`Installing Locales Database`)
      Session.localesPath = await install(Session.localesPath)
      logChildItem(`Done (${timer.now()} seconds)`)
    }
  }

  /**
   * Get Collection from Factory using cwd()
   * @param {string[]} componentNames
   * @return {Promise<Collection|module:models/Collection>}
   */
  static async getCollectionFromCwd(componentNames) {
    return collectionFactory(cwd(), componentNames)
  }

  /**
   * Update Theme in .explorer folder on file change
   * @param {string} themePath
   * @param {string} collectionPath Watcher Instance
   * @param {string[]} componentNames
   * @param {string} event Watcher Event Name
   * @param {string} eventPath Watcher Event Path
   * @return {Promise<void>}
   */
  static async handleThemeFileWatcherEvent(themePath, collectionPath, componentNames, event, eventPath) {
    const source = join(themePath, eventPath)
    const destination = join(collectionPath, DEV_FOLDER_NAME, eventPath)

    await handleWatcherEvent(event, eventPath, source, destination)

    if (eventPath === THEME_LAYOUT_FILE) {
      // Inject references to the Collection's main CSS file in the theme's main liquid file
      const collection = await this.getCollectionFromCwd(componentNames)
      collection.build = collectionBuildFactory(collection)
      const devFolder = join(cwd(), DEV_FOLDER_NAME)
      const theme = await themeFactory(devFolder)
      await injectAssetReferences(collection, theme)
    }
    console.log(Session.setupFiles)
    console.log(eventPath)
    console.log(THEME_INDEX_TEMPLATE_LIQUID_FILE)
    if (Session.setupFiles && eventPath === THEME_INDEX_TEMPLATE_LIQUID_FILE) {
      let collection = await this.getCollectionFromCwd(componentNames)
      collection = await collectionBuilder(collection)
      const indexTemplate = await buildIndexTemplate(collection.components, themePath)
      await saveFile(join(cwd(), DEV_FOLDER_NAME, THEME_INDEX_TEMPLATE_LIQUID_FILE), indexTemplate)
    }
  }

  static async runThemeDev(cwd) {
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
      shopifyThemeDev.on('close', (code) => {
        resolve(code)
      })
    })
  }

  /**
   *
   * @param {string[]} argv
   * @param {Object} flags
   * @param {Object} metadata
   * @param {Object} tomlConfig
   * @return {Promise<void>}
   */
  static async setSessionValues(argv, flags, metadata, tomlConfig) {
    Session.callerType = COLLECTION_TYPE_NAME
    Session.components = getValuesFromArgvOrToml(COMPONENT_ARG_NAME, argv, tomlConfig)
    Session.localesPath = await getPathFromFlagOrTomlValue(LOCALES_FLAG_NAME, flags, metadata, tomlConfig)
    Session.syncMode = getValueFromFlagOrToml(THEME_SYNC_FLAG_NAME, flags, metadata, tomlConfig)
    Session.watchMode = getValueFromFlagOrToml(WATCH_FLAG_NAME, flags, metadata, tomlConfig)

    const tomlConfigExits = tomlConfig != null
    const issetSetupFlag = !!(
      !metadata.flags[SETUP_FLAG_NAME]?.setFromDefault ||
      (tomlConfigExits && Object.hasOwn(tomlConfig, SETUP_FLAG_NAME))
    )
    const isSetupFlagSetInArgv = !metadata.flags[SETUP_FLAG_NAME]?.setFromDefault
    const isThemeFlagSetInArgv = !metadata.flags[THEME_FLAG_NAME]?.setFromDefault
    const isSetupFlagSetInConfig = !!(tomlConfigExits && Object.hasOwn(tomlConfig, SETUP_FLAG_NAME))
    // const isThemeFlagSetInConfig = !!(tomlConfigExits && Object.hasOwn(tomlConfig, THEME_FLAG_NAME))
    const issetThemeFlag = !!(
      !metadata.flags[THEME_FLAG_NAME]?.setFromDefault ||
      (tomlConfigExits && Object.hasOwn(tomlConfig, THEME_FLAG_NAME))
    )

    // If the theme flag is set on the command line and the setup flag is set to true in the config file,
    // the setup flag is set to false since command line args have priority over config file args.
    // A Warning is issued to explain that the command-line flag takes precedence over toml file flags.
    if (isThemeFlagSetInArgv && !isSetupFlagSetInArgv && isSetupFlagSetInConfig && tomlConfig[SETUP_FLAG_NAME]) {
      Session.setupFiles = false
      warn(
        'The command-line flags takes precedence over the toml file values. Setup files will be ignored since a theme-path was specified at the command line.'
      )
    }
    // When only a theme path is specified, the setup-files flag default true value will be manually changed to false.
    else if (issetThemeFlag && !issetSetupFlag) {
      Session.setupFiles = false
    } else {
      Session.setupFiles = getValueFromFlagOrToml(SETUP_FLAG_NAME, flags, metadata, tomlConfig)
    }

    if (Session.setupFiles) {
      Session.themePath = join(getCLIRootFolderName(), 'resources/explorer')
      if (issetThemeFlag && issetSetupFlag) {
        // A Warning is issued to the user explaining that setup files cannot be used with a theme.
        warn('The setup-files flag is not available with a custom theme. The component explorer will be used instead.')
      }
    } else {
      Session.themePath = await getPathFromFlagOrTomlValue(THEME_FLAG_NAME, flags, metadata, tomlConfig)
    }
  }

  /**
   * Watch Collection for file changes
   * @param {string} collectionPath
   * @param {string[]} ignorePatterns
   * @param {string[]} componentNames
   * @param {string} themePath
   * @returns {Promise<FSWatcher>}
   */
  static async watchComponents(collectionPath, ignorePatterns, themePath, componentNames) {
    const watcher = getWatcher(collectionPath, ignorePatterns)
    const onCollectionWatchEvent = this.exploreComponent.bind(this, themePath, componentNames)

    return watch(watcher, onCollectionWatchEvent)
  }

  /**
   * Watch locales for file changes
   * @param {string} localesPath
   * @param {string[]} componentNames
   * @param {string} themePath
   * @return {Promise<FSWatcher>}
   */
  static async watchLocales(localesPath, themePath, componentNames) {
    const watchGlobExpression = join(localesPath, '**/*.json')

    const watcher = getWatcher(watchGlobExpression)
    const onLocalesWatchEvent = this.exploreComponent.bind(this, themePath, componentNames)

    return watch(watcher, onLocalesWatchEvent)
  }

  /**
   * Watch Theme for file changes
   * @param {string} themePath
   * @param {(string|RegExp)[]} ignorePatterns
   * @param {string} collectionRootFolder
   * @param {string[]} componentNames
   * @return {Promise<FSWatcher>}
   */
  static async watchTheme(themePath, ignorePatterns, collectionRootFolder, componentNames) {
    const watcher = getWatcher(themePath, ignorePatterns)
    const onThemeWatchEvent = await this.handleThemeFileWatcherEvent.bind(
      this,
      themePath,
      collectionRootFolder,
      componentNames
    )

    return watch(watcher, onThemeWatchEvent)
  }
}
