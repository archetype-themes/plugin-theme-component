import CollectionFactory from '../../factory/CollectionFactory.js'
import SectionFactory from '../../factory/SectionFactory.js'
import CollectionBuilder from '../../builders/CollectionBuilder.js'
import SectionBuilder from '../../builders/SectionBuilder.js'
import logger from '../../utils/Logger.js'
import Watcher from '../../utils/Watcher.js'
import Collection from '../../models/Collection.js'
import Section from '../../models/Section.js'

class BuildCommand {
  /** @type {string} **/
  static NAME = 'build'
  /** @type {string[]} **/
  static ENABLED_COMPONENTS = [Collection.COMPONENT_NAME, Section.COMPONENT_NAME]
  /** @type {string[]} **/
  static AVAILABLE_OPTIONS = [Collection.COMPONENT_NAME, Section.COMPONENT_NAME]

  static async execute (commandOption, targetComponentName, watchMode) {
    const promises = []

    if (commandOption === Collection.COMPONENT_NAME) {
      const collection = await this.buildCollection()
      if (watchMode) {
        promises.push(this.watchCollection(collection.rootFolder))
      }
    }
    // Build/Watch Section
    else if (commandOption === Section.COMPONENT_NAME) {
      const section = await this.buildSection(targetComponentName)

      if (watchMode) {
        await this.watchSection(section.rootFolder)
      }
    }

    return Promise.all(promises)
  }

  /**
   * Build Collection
   * @return {Promise<module:models/Collection>}
   */
  static async buildCollection () {
    const collection = await CollectionFactory.fromCollectionBuildCommand()
    collection.sections = await SectionFactory.fromCollection(collection)
    await CollectionBuilder.build(collection)
    return Promise.resolve(collection)
  }

  /**
   * Build A Single Section
   * @param sectionName
   * @return {Promise<Section>}
   */
  static async buildSection (sectionName) {
    const section = await SectionFactory.fromName(sectionName)
    await SectionBuilder.build(section)
    return Promise.resolve(section)
  }

  static async watchCollection (collectionRootFolder) {
    Watcher.watch(['sections/*/src/*', 'snippets/*/src/*'], this.onCollectionWatchEvent, collectionRootFolder)
  }

  static async watchSection (sectionName, sectionRootFolder) {
    const onSectionWatchEvent = this.onSectionWatchEvent.bind(null, sectionName)
    Watcher.watch(['sections/*/src/*', '../snippets/*/src/*'], onSectionWatchEvent, sectionRootFolder)
  }

  static async onCollectionWatchEvent (event, path) {
    logger.debug(`Watcher Event: "${event}" on file: ${path} detected`)
    return BuildCommand.buildCollection()
  }

  static async onSectionWatchEvent (sectionName, event, path) {
    logger.debug(`Watcher Event: "${event}" on file: ${path} detected`)
    console.log(sectionName)
    await BuildCommand.buildSection(sectionName)
  }
}

export default BuildCommand
