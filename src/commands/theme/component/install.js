// External Dependencies
import { Args, Flags, ux } from '@oclif/core'

// Internal Dependencies
import Build from './build.js'
import { BaseCommand, COMPONENT_ARG_NAME, LOCALES_FLAG_NAME } from '../../../config/baseCommand.js'
import { THEME_TYPE_NAME } from '../../../config/Components.js'
import CollectionFactory from '../../../factory/CollectionFactory.js'
import ThemeFactory from '../../../factory/ThemeFactory.js'
import CollectionInstaller from '../../../installers/CollectionInstaller.js'
import Session from '../../../models/static/Session.js'
import Timer from '../../../models/Timer.js'
import CollectionUtils from '../../../utils/CollectionUtils.js'
import { install } from '../../../utils/ExternalComponentUtils.js'
import { getPathFromFlagOrTomlValue, getValuesFromArgvOrToml } from '../../../utils/SessionUtils.js'
import { isRepoUrl } from '../../../utils/WebUtils.js'

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
      description: 'The path to your components should point to a GitHub URL or a local path. This defaults to Archetype Themes\' publicly shared reference components.',
      helpGroup: 'Path',
      helpValue: '<path-or-github-url>',
      char: 'c',
      default: 'https://github.com/archetype-themes/reference-components.git'
    }),
    [LOCALES_FLAG_NAME]: Flags.string({
      summary: 'Path to your locales data',
      description: 'The path to your locales data should point to a GitHub URL or a local path. This defaults to Archetype Themes\' publicly shared locales database.',
      helpGroup: 'Path',
      helpValue: '<path-or-github-url>',
      char: 'l',
      default: 'https://github.com/archetype-themes/locales.git',
      defaultHelp: 'Path to the publicly shared locales repository form Archetype Themes'
    })
  }

  // Enables limitless args entry
  static strict = false

  async run () {
    const { argv, flags, metadata } = await this.parse(Install)
    BaseCommand.setUxOutputLevel(flags)
    const tomlConfig = await super.run()

    await Install.setSessionValues(argv, flags, metadata, tomlConfig)

    // Creating Theme
    const theme = ThemeFactory.fromThemeInstallCommand()

    let collection = await CollectionFactory.fromInstallCommand(Session.componentsPath, Session.components)

    // Install it locally if the source is a URL
    if (isRepoUrl(collection.source)) {
      await install(collection.source, collection.rootFolder, collection.name)
    }

    collection = await CollectionUtils.initCollectionFiles(collection)

    await Install.installOne(theme, collection)
  }

  /**
   * Install a Collection
   * @param {import('../../models/Theme.js').default} theme
   * @param {module:models/Collection} collection
   * @return {Promise<module:models/Collection>}
   */
  static async installOne (theme, collection) {
    ux.info(`Building & Installing the ${collection.name} Collection.`)
    const startTime = new Timer()

    // Build using the Build Command
    await Build.buildCollection(collection)
    await Build.deployCollection(collection)
    // Install and time it!
    ux.info(`Installing the ${collection.name} Collection for the ${theme.name} Theme.`)
    const installStartTime = new Timer()
    await CollectionInstaller.install(theme, collection)
    ux.info(`${collection.name}: Install Complete in ${installStartTime.now()} seconds`)
    ux.info(`${collection.name}: Build & Install Completed in ${startTime.now()} seconds\n`)
    return Promise.resolve(collection)
  }

  static async setSessionValues (argv, flags, metadata, tomlConfig) {
    Session.callerType = THEME_TYPE_NAME
    Session.components = getValuesFromArgvOrToml(COMPONENT_ARG_NAME, argv, tomlConfig)
    Session.componentsPath = await getPathFromFlagOrTomlValue(COMPONENTS_FLAG_NAME, flags, metadata, tomlConfig)
    Session.localesPath = await getPathFromFlagOrTomlValue(LOCALES_FLAG_NAME, flags, metadata, tomlConfig)
  }
}
