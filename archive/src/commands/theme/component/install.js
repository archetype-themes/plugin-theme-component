// External Dependencies
import { cwd } from 'node:process'
import { Args, Flags } from '@oclif/core'

// Internal Dependencies
import { buildCollection } from '../../../builders/collectionBuilder.js'
import { BaseCommand, COMPONENT_ARG_NAME } from '../../../config/baseCommand.js'
import { THEME_TYPE_NAME } from '../../../config/constants.js'
import { collectionFactory } from '../../../factory/collectionFactory.js'
import { themeFactory } from '../../../factory/themeFactory.js'
import { installCollection } from '../../../installers/collectionInstaller.js'
import Session from '../../../models/static/Session.js'
import Timer from '../../../models/Timer.js'
import { getCurrentTime } from '../../../utils/dateUtils.js'
import { install } from '../../../utils/externalComponents.js'
import { isGitHubUrl } from '../../../utils/gitUtils.js'
import { info, logChildItem } from '../../../utils/logger.js'
import { getPathFromFlagOrTomlValue, getValuesFromArgvOrToml } from '../../../utils/sessionUtils.js'
import { displayCollectionTree, displayThemeTree, setComponentHierarchy } from '../../../utils/treeUtils.js'

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
    })
  }

  // Enables limitless args entry
  static strict = false

  async run() {
    const { argv, flags, metadata } = await this.parse(Install)
    BaseCommand.setLogLevel(flags)
    const tomlConfig = await super.run()

    await Install.setSessionValues(argv, flags, metadata, tomlConfig)

    // Download Components If We Have A GitHub Repo URL
    if (isGitHubUrl(Session.componentsPath)) {
      const timer = new Timer()
      logChildItem(`Installing Components`)
      Session.componentsPath = await install(Session.componentsPath)
      logChildItem(`Done (${timer.now()} seconds)`)
    }

    // Create The Theme
    const theme = await themeFactory(cwd())

    const componentNames = Session.componentNames?.length ? Session.componentNames : [...theme.snippetNames]
    // Create The Collection
    const collection = await collectionFactory(Session.componentsPath, componentNames)

    // If no component names are provided, use theme sections' render names
    if (!Session.componentNames?.length) {
      await setComponentHierarchy([...theme.layouts, ...theme.sections, ...theme.templates], collection.allComponents)
      displayThemeTree(theme)
    } else {
      displayCollectionTree(collection)
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
    info(`Building & Installing the ${collection.name}.`)
    const startTime = new Timer()

    // Build using the Build Command
    collection = await buildCollection(collection)

    // Install and time it!
    info(`Installing ${collection.name} for ${theme.name}.`)
    const installStartTime = new Timer()
    await installCollection(collection, theme)
    info(`${collection.name}: Install Complete in ${installStartTime.now()} seconds`)
    info(`${collection.name}: Build & Install Completed in ${startTime.now()} seconds at ${getCurrentTime()}\n`)
    return Promise.resolve(collection)
  }

  static async setSessionValues(argv, flags, metadata, tomlConfig) {
    Session.callerType = THEME_TYPE_NAME
    Session.componentNames = getValuesFromArgvOrToml(COMPONENT_ARG_NAME, argv, tomlConfig)
    Session.componentsPath = await getPathFromFlagOrTomlValue(COMPONENTS_FLAG_NAME, flags, metadata, tomlConfig)
  }
}
