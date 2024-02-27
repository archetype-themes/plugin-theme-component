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
import { COMPONENT_ARG_NAME, LOCALES_FLAG_NAME } from './dev.js'
import Build from './build.js'
import CollectionInstaller from '../../../installers/CollectionInstaller.js'
import Timer from '../../../models/Timer.js'
import { Args, Flags } from '@oclif/core'

export const COMPONENTS_FLAG_NAME = 'components-path'
export default class Install extends BaseCommand {
  static description = 'Install a collection of components'

  static args = {
    [COMPONENT_ARG_NAME]: Args.string({
      description: 'Component name(s)'
    })
  }

  static flags = {
    [LOCALES_FLAG_NAME]: Flags.string({
      summary: 'Path to your locales data',
      description: 'The path to your locales data should point to a GitHub URL or a local path. This defaults to Archetype Themes\' publicly shared locales database.',
      helpGroup: 'Path',
      helpValue: '<path-or-github-url>',
      char: 'l',
      default: 'https://github.com/archetype-themes/locales.git',
      defaultHelp: 'Path to the publicly shared locales repository form Archetype Themes'
    }),
    [COMPONENTS_FLAG_NAME]: Flags.string({
      summary: 'Path to your components',
      description: 'The path to your components should point to a GitHub URL or a local path. This defaults to Archetype Themes\' publicly shared reference components.',
      helpGroup: 'Path',
      helpValue: '<path-or-github-url>',
      char: 'c',
      default: 'https://github.com/archetype-themes/reference-components.git',
    })
  }

  async run () {
    const tomlConfig = await getTomlConfig()
    sessionFactory(this.id, tomlConfig)

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
    }
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
}
