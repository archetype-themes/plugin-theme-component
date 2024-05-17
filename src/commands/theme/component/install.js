// External Dependencies
import { basename } from 'node:path'
import { Args, Flags, ux } from '@oclif/core'

// Internal Dependencies
import { BaseCommand, COMPONENT_ARG_NAME, LOCALES_FLAG_NAME } from '../../../config/baseCommand.js'
import { THEME_TYPE_NAME } from '../../../config/Components.js'
import { getPathFromFlagOrTomlValue, getValuesFromArgvOrToml } from '../../../utils/SessionUtils.js'
import { getCurrentTime } from '../../../utils/DateUtils.js'
import Build from './build.js'
import CollectionFactory from '../../../factory/CollectionFactory.js'
import CollectionInstaller from '../../../installers/CollectionInstaller.js'
import Session from '../../../models/static/Session.js'
import ThemeFactory from '../../../factory/ThemeFactory.js'
import Timer from '../../../models/Timer.js'
import { isGitHubUrl, getRepoNameFromGitHubUrl } from '../../../utils/GitUtils.js'
import { setupRepo } from '../../../utils/ExternalComponentUtils.js'
import { logChildItem } from '../../../utils/LoggerUtils.js'

const COMPONENTS_FLAG_NAME = 'components-path'
export default class Install extends BaseCommand {
  static description = 'Install a collection of components'

  static args = {
    [COMPONENT_ARG_NAME]: Args.string({
      description: 'Component name(s)'
    })
  }

  static flags = {
    [COMPONENTS_FLAG_NAME]: Flags.string({
      summary: 'Path to your components',
      description:
        "The path to your components should point to a GitHub URL or a local path. This defaults to Archetype Themes' publicly shared reference components.",
      helpGroup: 'Path',
      helpValue: '<path-or-github-url>',
      char: 'c',
      default: 'https://github.com/archetype-themes/reference-components.git'
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
    })
  }

  // Enables limitless args entry
  static strict = false

  async run() {
    const { argv, flags, metadata } = await this.parse(Install)
    BaseCommand.setUxOutputLevel(flags)
    const tomlConfig = await super.run()

    await Install.setSessionValues(argv, flags, metadata, tomlConfig)

    // Creating Theme
    const theme = ThemeFactory.fromThemeInstallCommand()

    // Download Components If We Have A GitHub Repo URL
    let collectionName
    if (isGitHubUrl(Session.componentsPath)) {
      const timer = new Timer()
      logChildItem(`Installing Components`)
      collectionName = getRepoNameFromGitHubUrl(Session.componentsPath)
      Session.componentsPath = await setupRepo(Session.componentsPath)
      logChildItem(`Done (${timer.now()} seconds)`)
    } else {
      collectionName = basename(Session.componentsPath)
    }

    // Init Collection
    const collection = await CollectionFactory.fromPath(collectionName, Session.componentsPath, Session.components)

    // Download Locales If We Have A GitHub Repo URL
    if (isGitHubUrl(Session.localesPath)) {
      const timer = new Timer()
      logChildItem(`Installing Locales Database`)
      Session.localesPath = await setupRepo(Session.localesPath)
      logChildItem(`Done (${timer.now()} seconds)`)
    }

    await Install.installOne(theme, collection)
  }

  /**
   * Install a Collection
   * @param {import('../../models/Theme.js').default} theme
   * @param {module:models/Collection} collection
   * @return {Promise<module:models/Collection>}
   */
  static async installOne(theme, collection) {
    ux.info(`Building & Installing the ${collection.name}.`)
    const startTime = new Timer()

    // Build using the Build Command
    await Build.buildCollection(collection)
    await Build.deployCollection(collection)
    // Install and time it!
    ux.info(`Installing ${collection.name} for ${theme.name}.`)
    const installStartTime = new Timer()
    await CollectionInstaller.install(theme, collection)
    ux.info(`${collection.name}: Install Complete in ${installStartTime.now()} seconds`)
    ux.info(`${collection.name}: Build & Install Completed in ${startTime.now()} seconds at ${getCurrentTime()}\n`)
    return Promise.resolve(collection)
  }

  static async setSessionValues(argv, flags, metadata, tomlConfig) {
    Session.callerType = THEME_TYPE_NAME
    Session.components = getValuesFromArgvOrToml(COMPONENT_ARG_NAME, argv, tomlConfig)
    Session.componentsPath = await getPathFromFlagOrTomlValue(COMPONENTS_FLAG_NAME, flags, metadata, tomlConfig)
    Session.localesPath = await getPathFromFlagOrTomlValue(LOCALES_FLAG_NAME, flags, metadata, tomlConfig)
  }
}
