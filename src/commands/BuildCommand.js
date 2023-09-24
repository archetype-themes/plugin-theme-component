// Node imports
import path from 'node:path'

// Archie imports
import CollectionBuilder from './runners/CollectionBuilder.js'
import CollectionFactory from '../factory/CollectionFactory.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import ComponentBuilder from './runners/ComponentBuilder.js'
import ComponentFactory from '../factory/ComponentFactory.js'
import Components from '../config/Components.js'
import InternalError from '../errors/InternalError.js'
import NodeUtils from '../utils/NodeUtils.js'
import SectionFactory from '../factory/SectionFactory.js'
import SectionBuilder from './runners/SectionBuilder.js'
import Session from '../models/static/Session.js'
import SnippetBuilder from './runners/SnippetBuilder.js'
import SnippetFactory from '../factory/SnippetFactory.js'
import SnippetUtils from '../utils/SnippetUtils.js'
import Timer from '../utils/Timer.js'
import Watcher from '../utils/Watcher.js'
import logger from '../utils/Logger.js'

class BuildCommand {
  /**
   * Execute Build Command
   * @returns {Promise<FSWatcher|module:models/Collection|Section>}
   */
  static async execute () {
    switch (Session.commandOption) {
      case Components.COLLECTION_COMPONENT_TYPE_NAME:
        return await this.handleCollection()
      case Components.SECTION_COMPONENT_TYPE_NAME:
        return await this.handleSection()
      default:
        throw new InternalError('CRITICAL ERROR: A validated Build Command is in Error.')
    }
  }

  /**
   * Handle Collection
   * @returns {Promise<Collection|module:models/Collection|FSWatcher>}
   */
  static async handleCollection () {
    const collectionName = NodeUtils.getPackageName()
    const componentNames = Session.archieConfig?.components

    if (Session.watchMode) {
      const collection = await this.buildCollection(collectionName, componentNames)

      return this.watchCollection(collection)
    }

    return this.buildCollection(collectionName, componentNames)
  }

  static async handleSection () {
    if (Session.watchMode) {
      const section = await this.buildSection(Session.targetComponentName)

      return this.watchSection(section)
    }

    return this.buildSection(Session.targetComponentName)
  }

  /**
   * Build a Collection
   * @param {string} collectionName
   * @param {string[]} sectionNames
   * @return {Promise<module:models/Collection>}
   */
  static async buildCollection (collectionName, sectionNames) {
    logger.info(`${collectionName} => Initializing Components`)
    const initStartTime = Timer.getTimer()

    const collection = await CollectionFactory.fromName(collectionName, sectionNames)

    const initializedComponents = await Promise.all([
      this.initializeSections(collection.sections),
      this.initializeSnippets(collection.snippets),
      this.initializeComponents(collection.components)
    ]);

    // Destructuring the results to get each result separately
    [collection.sections, collection.snippets, collection.components] = initializedComponents

    logger.info(`${collectionName} => Found ${collection.components.length} components, ${collection.sections.length} sections and  ${collection.snippets.length} snippets.`)
    logger.info(`${collectionName} => Initialization complete (${Timer.getEndTimerInSeconds(initStartTime)} seconds)`)
    logger.info('')

    logger.info(`${collectionName} => Building Individual Components`)
    const buildStartTime = Timer.getTimer()
    collection.snippets = await this.buildSnippets(collection.snippets)

    const builtComponents = await Promise.all([
      this.buildSections(collection.sections),
      this.buildComponents(collection.components)
    ]);

    [collection.sections, collection.components] = builtComponents

    logger.info(`${collectionName} => Build complete (${Timer.getEndTimerInSeconds(buildStartTime)} seconds)`)
    logger.info('')

    logger.info(`${collectionName} => Structuring Components Tree`)
    const treeStartTime = Timer.getTimer()

    // Component Hierarchy
    for (const section of collection.sections) {
      for (const snippetName of section.snippetNames) {
        section.snippets.push(await SnippetUtils.buildRecursivelyNew(snippetName, section.files.snippetFiles, collection.snippets))
      }
    }

    logger.info('')
    logger.info(`${collectionName}/`)
    for (const section of collection.sections) {
      this.folderTreeLog(section)
    }
    logger.info('')

    logger.info(`${collectionName} => Tree complete (${Timer.getEndTimerInSeconds(treeStartTime)} seconds)`)
    logger.info('')

    logger.info(`${collectionName} => Building Collection`)
    const collectionStartTime = Timer.getTimer()

    await CollectionBuilder.build(collection)

    logger.info(`${collectionName} => Collection Build complete (${Timer.getEndTimerInSeconds(collectionStartTime)} seconds)`)
    logger.info('')
    logger.info(`${collectionName} => Build Command Total Time: ${Timer.getEndTimerInSeconds(initStartTime)} seconds`)
    logger.info('')
    return Promise.resolve(collection)
  }

  /**
   * Initialize Components
   * @param {Component[]}components
   * @returns {Promise<Component[]>}
   */
  static async initializeComponents (components) {
    const initializePromises = []
    for (const component of components) {
      initializePromises.push(ComponentFactory.initializeComponent(component))
    }
    return Promise.all(initializePromises)
  }

  /**
   * Initialize Sections
   * @param {Section[]} sections
   * @returns {Promise<Section[]>}
   */
  static async initializeSections (sections) {
    const initializePromises = []
    for (const section of sections) {
      initializePromises.push(SectionFactory.initializeSection(section))
    }
    return Promise.all(initializePromises)
  }

  /**
   * Folder Tree Log
   * @param {Section|Snippet|Component} component
   * @param {string} [prefix= '│ ']
   * @param {boolean} [last=false]
   * @returns {void}
   */
  static folderTreeLog (component, prefix = '', last = false) {
    const ascii = last ? '└──' : '├──'
    logger.info(`${prefix}${ascii} ${component.name}`)

    for (const [i, snippet] of component.snippets.entries()) {
      const last = i === component.snippets.length - 1
      this.folderTreeLog(snippet, `│    ${prefix}`, last)
    }
  }

  /**
   * Initialize Snippets
   * @param {Snippet[]}snippets
   * @returns {Promise<Snippet[]>}
   */
  static async initializeSnippets (snippets) {
    const initializePromises = []
    for (const snippet of snippets) {
      initializePromises.push(SnippetFactory.initializeSnippet(snippet))
    }
    return Promise.all(initializePromises)
  }

  /**
   * Build Sections
   * @param {Section[]}sections
   * @returns {Promise<Awaited<Section>[]>}
   */
  static async buildSections (sections) {
    const buildPromises = []
    for (const section of sections) {
      buildPromises.push(SectionBuilder.build(section))
    }
    return Promise.all(buildPromises)
  }

  /**
   * Build Snippets
   * @param {Snippet[]}snippets
   * @returns {Promise<Awaited<Snippet>[]>}
   */
  static async buildSnippets (snippets) {
    const buildPromises = []
    for (const snippet of snippets) {
      buildPromises.push(SnippetBuilder.build(snippet))
    }
    return Promise.all(buildPromises)
  }

  /**
   * Build Components
   * @param {Component[]}components
   * @returns {Promise<Awaited<Component>[]>}
   */
  static async buildComponents (components) {
    const buildPromises = []
    for (const component of components) {
      buildPromises.push(ComponentBuilder.build(component))
    }
    return Promise.all(buildPromises)
  }

  /**
   * Build a Section
   * @param sectionName
   * @return {Promise<Section>}
   */
  static async buildSection (sectionName) {
    logger.info(`Starting ${sectionName}'s build...`)
    const startTime = Timer.getTimer()

    const section = await SectionFactory.fromName(sectionName)

    // Start from the bottom: Build Snippets first
    if (section.snippets?.length) {
      await SnippetUtils.buildRecursively(section.snippets)
    }
    // Build Section
    await SectionBuilder.build(section)
    // Write Build To Disk
    await SectionBuilder.writeBuild(section, await CollectionUtils.findRootFolder())
    logger.info(`Finished ${sectionName}'s build in ${Timer.getEndTimerInSeconds(startTime)} seconds`)

    return Promise.resolve(section)
  }

  /**
   * Watch a Collection
   * @param {module:models/Collection} collection
   * @return {FSWatcher}
   */
  static watchCollection (collection) {
    const watchFolders = CollectionUtils.getWatchFolders(collection)

    const watcher = Watcher.getWatcher(watchFolders)
    const onCollectionWatchEvent = this.onCollectionWatchEvent.bind(this, watcher)
    logger.info('--------------------------------------------------------')
    logger.info(`Watching Collection ${collection.name} for changes...`)
    logger.info('(Ctrl+C to abort)')
    logger.info('--------------------------------------------------------')
    return Watcher.watch(watcher, onCollectionWatchEvent)
  }

  /**
   * Watch a Section
   * @param {Section} section
   * @return {FSWatcher}
   */
  static watchSection (section) {
    const snippetRootFolders = SnippetUtils.getRootFoldersRecursively(section.snippets)
    const watchFolders = [section.rootFolder].concat(snippetRootFolders).map(folder => path.join(folder, 'src'))

    const watcher = Watcher.getWatcher(watchFolders)
    const onSectionWatchEvent = this.onSectionWatchEvent.bind(this, section.name, watcher)
    logger.info('--------------------------------------------------------')
    logger.info(`Watching Section ${section.name} for changes...`)
    logger.info('(Ctrl+C to abort)')
    logger.info('--------------------------------------------------------')
    return Watcher.watch(watcher, onSectionWatchEvent)
  }

  /**
   *
   * @param {FSWatcher} watcher
   * @param {string} event
   * @param {string} eventPath
   * @return {Promise<FSWatcher|void>}
   */
  static async onCollectionWatchEvent (watcher, event, eventPath) {
    const filename = path.basename(eventPath)
    logger.debug(`Watcher Event: "${event}" on file: ${eventPath} detected`)

    const collectionName = NodeUtils.getPackageName()
    const componentNames = Session.archieConfig?.components

    const collection = await this.buildCollection(collectionName, componentNames)
    // Restart Watcher on liquid file change to make sure we do refresh watcher snippet folders
    if (filename.endsWith('.liquid')) {
      await watcher.close()
      return this.watchCollection(collection)
    }
    logger.info('--------------------------------------------------------')
    logger.info(`Watching Collection ${collection.name} for changes...`)
    logger.info('(Ctrl+C to abort)')
    logger.info('--------------------------------------------------------')
  }

  /**
   *
   * @param {string} sectionName
   * @param {FSWatcher} watcher
   * @param {string} event
   * @param {string} eventPath
   * @return {Promise<FSWatcher|void>}
   */
  static async onSectionWatchEvent (sectionName, watcher, event, eventPath) {
    const filename = path.basename(eventPath)
    logger.info(`Watcher Event "${event}" on ${filename} detected`)

    const section = await this.buildSection(sectionName)

    // Restart Watcher on liquid file change to make sure we do refresh watcher snippet folders
    if (filename.endsWith('.liquid')) {
      await watcher.close()
      return this.watchSection(section)
    }
    logger.info('--------------------------------------------------------')
    logger.info(`Watching Section ${section.name} for changes...`)
    logger.info('(Ctrl+C to abort)')
    logger.info('--------------------------------------------------------')
  }
}

export default BuildCommand
