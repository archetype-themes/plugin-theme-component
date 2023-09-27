// Node imports
import path, { dirname, parse } from 'node:path'

// Archie imports
import CollectionBuilder from './runners/CollectionBuilder.js'
import CollectionFactory from '../factory/CollectionFactory.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import ComponentBuilder from './runners/ComponentBuilder.js'
import ComponentFactory from '../factory/ComponentFactory.js'
import Components from '../config/Components.js'
import InternalError from '../errors/InternalError.js'
import NodeUtils from '../utils/NodeUtils.js'
import SectionBuilder from './runners/SectionBuilder.js'
import Session from '../models/static/Session.js'
import Snippet from '../models/Snippet.js'
import SnippetBuilder from './runners/SnippetBuilder.js'
import SnippetUtils from '../utils/SnippetUtils.js'
import Timer from '../utils/Timer.js'
import Watcher from '../utils/Watcher.js'
import logger from '../utils/Logger.js'
import { plural } from '../utils/SyntaxUtils.js'

class BuildCommand {
  /**
   * Execute Build Command
   * @returns {Promise<FSWatcher|module:models/Collection|Section>}
   */
  static async execute () {
    const collectionName = NodeUtils.getPackageName()
    let componentNames
    switch (Session.commandOption) {
      case Components.COLLECTION_COMPONENT_TYPE_NAME:
        componentNames = Session.archieConfig?.components
        break
      case Components.SECTION_COMPONENT_TYPE_NAME:
        componentNames = [Session.targetComponentName]
        break
      default:
        throw new InternalError('CRITICAL ERROR: A validated Build Command is in Error.')
    }

    if (Session.watchMode) {
      const collection = await this.buildCollection(collectionName, componentNames)
      return this.watchCollection(collection)
    }

    return this.buildCollection(collectionName, componentNames)
  }

  /**
   * Build a Collection
   * @param {string} collectionName
   * @param {string[]} sectionNames
   * @return {Promise<module:models/Collection>}
   */
  static async buildCollection (collectionName, sectionNames) {
    const topPrefix = '════▶ '
    const childPrefix = '  ╚══▶  '

    logger.info(`${topPrefix}Initializing Components for "${Session.targetComponentName}"`)
    const initStartTime = Timer.getTimer()

    // Init Collection
    const collection = await CollectionFactory.fromName(collectionName, sectionNames)

    // Filter Out Sections When Applicable
    if (sectionNames?.length) {
      logger.info(`${childPrefix}Packaging the following component${sectionNames.length > 1 ? 's' : ''}: ${sectionNames.join(', ')}`)
      collection.sections = collection.sections.filter(section => sectionNames.includes(section.name))
    }

    // Initialize Individual Components
    [collection.sections, collection.snippets, collection.components] = await Promise.all([
      this.initializeComponents(collection.sections),
      this.initializeComponents(collection.snippets),
      this.initializeComponents(collection.components)
    ])

    // Initialize Embedded Snippets
    // This requires other components to be initialized first in order to access their embedded snippet file list
    let embeddedSnippets = (await Promise.all([
      this.createEmbeddedSnippets(collection.sections),
      this.createEmbeddedSnippets(collection.snippets),
      this.createEmbeddedSnippets(collection.components)
    ])).flat()

    embeddedSnippets = await this.initializeComponents(embeddedSnippets)
    collection.snippets.concat(embeddedSnippets)

    logger.info(`${childPrefix}Found ${collection.components.length} component${plural(collection.components)}, ${collection.sections.length} section${plural(collection.sections)} and  ${collection.snippets.length} snippet${plural(collection.snippets)}.`)

    // Filter Out Snippets When Applicable
    if (sectionNames?.length) {
      let allSnippetNames = SnippetUtils.getSnippetNames(collection.components)
      allSnippetNames = allSnippetNames.concat(SnippetUtils.getSnippetNames(collection.sections))
      allSnippetNames = allSnippetNames.concat(SnippetUtils.getSnippetNames(collection.snippets))

      // Remove Duplicates
      allSnippetNames = [...new Set(allSnippetNames)]
      collection.snippets = collection.snippets.filter(snippet => allSnippetNames.includes(snippet.name))
    }

    logger.info(`${childPrefix}Assembling ${collection.components.length} component${plural(collection.components)}, ${collection.sections.length} section${plural(collection.sections)} and  ${collection.snippets.length} snippet${plural(collection.snippets)}.`)

    logger.info(`${childPrefix}Initialization complete (${Timer.getEndTimerInSeconds(initStartTime)} seconds)`)
    logger.info('')

    logger.info(`${topPrefix}Building Individual Components for ${Session.targetComponentName}`)
    const buildStartTime = Timer.getTimer();

    // Build Components
    [collection.sections, collection.snippets, collection.components] = (await Promise.all([
      Promise.all(collection.sections.map(section => SectionBuilder.build(section))),
      Promise.all(collection.snippets.map(snippet => SnippetBuilder.build(snippet))),
      Promise.all(collection.components.map(component => ComponentBuilder.build(component)))
    ]))

    logger.info(`${childPrefix}Build complete (${Timer.getEndTimerInSeconds(buildStartTime)} seconds)`)
    logger.info('')

    logger.info(`${topPrefix}Structuring Components Tree for ${Session.targetComponentName}`)
    const treeStartTime = Timer.getTimer()

    // Build Component Hierarchy Structure
    const snippets = []
    snippets.push(...collection.components)
    snippets.push(...collection.snippets)
    await this.setComponentHierarchy(collection.sections, snippets)
    await this.setComponentHierarchy(collection.snippets, snippets)
    await this.setComponentHierarchy(collection.components, snippets)

    const indent = '  ║     '
    logger.info(indent)
    logger.info(`${indent}${collectionName}/`)

    for (const [i, section] of collection.sections.entries()) {
      const last = i === collection.sections.length - 1
      this.folderTreeLog(section, last, indent)
    }
    logger.info(indent)

    logger.info(`${childPrefix}Tree complete (${Timer.getEndTimerInSeconds(treeStartTime)} seconds)`)
    logger.info('')

    logger.info(`${topPrefix}Building Collection`)
    const collectionStartTime = Timer.getTimer()

    await CollectionBuilder.build(collection)

    logger.info(`${childPrefix}Collection Build complete (${Timer.getEndTimerInSeconds(collectionStartTime)} seconds)`)
    logger.info('')
    logger.info(`${topPrefix}Build Command Total Time: ${Timer.getEndTimerInSeconds(initStartTime)} seconds`)
    logger.info('')
    return Promise.resolve(collection)
  }

  /**
   * Initialize Components
   * @param {(Component|Section|Snippet)[]}components
   * @returns {Promise<(Component|Section|Snippet)[]>}
   */
  static async initializeComponents (components) {
    const initializePromises = []
    for (const component of components) {
      initializePromises.push(ComponentFactory.initializeComponent(component))
    }
    return Promise.all(initializePromises)
  }

  /**
   * Create Embedded Snippets
   * @param {Section[]|Snippet[]|Component[]} components
   * @returns {Snippet[]}
   */
  static createEmbeddedSnippets (components) {
    const snippets = []

    for (const component of components) {
      if (component.files?.snippetFiles) {
        for (const snippetFile of component.files.snippetFiles) {
          snippets.push(new Snippet(parse(snippetFile).name, dirname(snippetFile)))
        }
      }
    }

    return snippets
  }

  /**
   * Attach Child Components
   * @param {Component[]|Section[]|Snippet[]} topComponents
   * @param {(Component|Snippet)[]} availableComponents
   */
  static async setComponentHierarchy (topComponents, availableComponents) {
    for (const topComponent of topComponents) {
      if (!topComponent.snippets?.length && topComponent.snippetNames?.length) {
        for (const snippetName of topComponent.snippetNames) {
          const snippet = availableComponents.find(component => component.name === snippetName)
          if (snippet !== undefined) {
            topComponent.snippets.push(snippet)
          }
        }
      }
    }
  }

  /**
   * Folder Tree Log
   * @param {Section|Snippet|Component} component
   * @param {boolean} [last=false]
   * @param {string} [indent='']
   * @param {Array} [grid=[true]]
   * @returns {void}
   */
  static folderTreeLog (component, last = false, indent = '', grid = []) {
    const ascii = last ? '└──' : '├──'

    let prefix = ''
    for (const gridItem of grid) {
      prefix += gridItem ? '│    ' : '     '
    }

    logger.info(`${indent}${prefix}${ascii} ${component.name}`)

    if (component.snippets?.length) {
      grid.push(!last)
      for (const [i, snippet] of component.snippets.entries()) {
        const lastChild = i === component.snippets.length - 1
        this.folderTreeLog(snippet, lastChild, indent, grid)

        lastChild && grid.pop()
      }
    }
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
}

export default BuildCommand
