// Node imports
import path, { dirname, parse } from 'node:path'
import Components from '../config/Components.js'
import CollectionFactory from '../factory/CollectionFactory.js'
import ComponentFactory from '../factory/ComponentFactory.js'
import Snippet from '../models/Snippet.js'
import Session from '../models/static/Session.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import logger, { logChildItem, logChildMessage, logSpacer, logTitleItem } from '../utils/Logger.js'
import NodeUtils from '../utils/NodeUtils.js'
import SnippetUtils from '../utils/SnippetUtils.js'
import { plural } from '../utils/SyntaxUtils.js'
import Timer from '../utils/Timer.js'
import Watcher from '../utils/Watcher.js'

// Archie imports
import CollectionBuilder from './runners/CollectionBuilder.js'
import ComponentBuilder from './runners/ComponentBuilder.js'
import SectionBuilder from './runners/SectionBuilder.js'
import SnippetBuilder from './runners/SnippetBuilder.js'

class BuildCommand {
  /**
   * Execute Build Command
   * @returns {Promise<FSWatcher|module:models/Collection|Section>}
   */
  static async execute () {
    const collectionName = NodeUtils.getPackageName()
    let componentNames
    if (Session.commandOption === Components.COLLECTION_COMPONENT_TYPE_NAME) {
      componentNames = Session.archieConfig?.components
    } else if (Session.commandOption === Components.SECTION_COMPONENT_TYPE_NAME) {
      componentNames = [Session.targetComponentName]
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
    logTitleItem(`Initializing Components for "${Session.targetComponentName}"`)
    const initStartTime = Timer.getTimer()

    // Init Collection
    const collection = await CollectionFactory.fromName(collectionName, sectionNames)

    // Filter Out Sections When Applicable
    if (sectionNames?.length) {
      logChildItem(`Packaging the following component${plural(sectionNames)}: ${sectionNames.join(', ')}`)
      collection.sections = collection.sections.filter(section => sectionNames.includes(section.name))
    }

    // Initialize Individual Components
    [collection.sections, collection.snippets, collection.components] = await Promise.all([
      Promise.all(collection.sections.map(component => ComponentFactory.initializeComponent(component))),
      Promise.all(collection.snippets.map(component => ComponentFactory.initializeComponent(component))),
      Promise.all(collection.components.map(component => ComponentFactory.initializeComponent(component)))
    ])

    // Initialize Embedded Snippets
    // This requires other components to be initialized first in order to access their embedded snippet file list
    let embeddedSnippets = (await Promise.all([
      this.createEmbeddedSnippets(collection.sections),
      this.createEmbeddedSnippets(collection.snippets),
      this.createEmbeddedSnippets(collection.components)
    ])).flat()

    embeddedSnippets = await Promise.all(embeddedSnippets.map(component => ComponentFactory.initializeComponent(component)))
    collection.snippets = collection.snippets.concat(embeddedSnippets)

    logChildItem(`Found ${collection.components.length} component${plural(collection.components)}, ${collection.sections.length} section${plural(collection.sections)} and  ${collection.snippets.length} snippet${plural(collection.snippets)}.`)

    // Filter Out Snippets When Applicable
    if (sectionNames?.length) {
      let allSnippetNames = SnippetUtils.getSnippetNames(collection.components)
      allSnippetNames = allSnippetNames.concat(SnippetUtils.getSnippetNames(collection.sections))
      allSnippetNames = allSnippetNames.concat(SnippetUtils.getSnippetNames(collection.snippets))

      // Remove Duplicates
      allSnippetNames = [...new Set(allSnippetNames)]
      collection.snippets = collection.snippets.filter(snippet => allSnippetNames.includes(snippet.name))
    }

    logChildItem(`Assembling ${collection.components.length} component${plural(collection.components)}, ${collection.sections.length} section${plural(collection.sections)} and  ${collection.snippets.length} snippet${plural(collection.snippets)}.`)

    logChildItem(`Initialization complete (${Timer.getEndTimerInSeconds(initStartTime)} seconds)`)
    logSpacer()

    logTitleItem(`Building Individual Components for ${Session.targetComponentName}`)
    const buildStartTime = Timer.getTimer();

    // Build Components
    [collection.sections, collection.snippets, collection.components] = (await Promise.all([
      Promise.all(collection.sections.map(section => SectionBuilder.build(section))),
      Promise.all(collection.snippets.map(snippet => SnippetBuilder.build(snippet))),
      Promise.all(collection.components.map(component => ComponentBuilder.build(component)))
    ]))

    logChildItem(`Build complete (${Timer.getEndTimerInSeconds(buildStartTime)} seconds)`)
    logSpacer()

    logTitleItem(`Structuring Components Tree for ${Session.targetComponentName}`)
    const treeStartTime = Timer.getTimer()

    // Build Component Hierarchy Structure
    const allSnippets = [...collection.components, ...collection.snippets]
    await this.setComponentHierarchy(collection.sections, allSnippets)
    await this.setComponentHierarchy(collection.snippets, allSnippets)
    await this.setComponentHierarchy(collection.components, allSnippets)

    logChildMessage()
    logChildMessage(`${collectionName}/`)

    for (const [i, section] of collection.sections.entries()) {
      const last = i === collection.sections.length - 1
      this.folderTreeLog(section, last)
    }
    logChildMessage()

    logChildItem(`Tree complete (${Timer.getEndTimerInSeconds(treeStartTime)} seconds)`)
    logSpacer()

    logTitleItem('Building Collection')
    const collectionStartTime = Timer.getTimer()

    await CollectionBuilder.build(collection)

    logChildItem(`Collection Build complete (${Timer.getEndTimerInSeconds(collectionStartTime)} seconds)`)
    logSpacer()
    logTitleItem(`Build Command Total Time: ${Timer.getEndTimerInSeconds(initStartTime)} seconds`)
    logSpacer()
    return Promise.resolve(collection)
  }

  /**
   * Create Embedded Snippets
   * @param {Section[]|Snippet[]|Component[]} components
   * @returns {Snippet[]}
   */
  static createEmbeddedSnippets (components) {
    const filteredComponents = components.filter(component => component.files?.snippetFiles)

    return filteredComponents.map(component =>
      component.files.snippetFiles.map(snippetFile =>
        new Snippet(parse(snippetFile).name, dirname(snippetFile))
      )
    ).flat()
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
   * @param {Array} [grid=[true]]
   * @returns {void}
   */
  static folderTreeLog (component, last = false, grid = []) {
    const ascii = last ? '└──' : '├──'

    let prefix = ''
    grid.forEach(gridItem => { prefix += gridItem ? '│    ' : '     ' })

    logChildMessage(`${prefix}${ascii} ${component.name}`)

    if (component.snippets?.length) {
      grid.push(!last)
      for (const [i, snippet] of component.snippets.entries()) {
        const lastChild = i === component.snippets.length - 1
        this.folderTreeLog(snippet, lastChild, grid)

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
   * Action Taken On Collection Watch Event
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
