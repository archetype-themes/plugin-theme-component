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

// Internal Imports
import CollectionBuilder from './runners/CollectionBuilder.js'
import ComponentBuilder from './runners/ComponentBuilder.js'
import SnippetBuilder from './runners/SnippetBuilder.js'

class BuildCommand {
  /**
   * Execute Build Command
   * @returns {Promise<FSWatcher|void>}
   */
  static async execute () {
    const collectionName = NodeUtils.getPackageName()
    let componentNames
    if (Session.targetType === Components.COLLECTION_TYPE_NAME) {
      componentNames = Session.config?.components
    } else if (Session.targetType === Components.COMPONENT_TYPE_NAME) {
      componentNames = [Session.targetName]
    }

    if (Session.watchMode) {
      const collection = await this.buildCollection(collectionName, componentNames)
      await this.deployCollection(collection)
      return this.watchCollection(collection)
    }

    const collection = await this.buildCollection(collectionName, componentNames)
    return this.deployCollection(collection)
  }

  /**
   * Build a Collection
   * @param {string} collectionName
   * @param {string[]} componentNames
   * @return {Promise<module:models/Collection>}
   */
  static async buildCollection (collectionName, componentNames) {
    logTitleItem(`Initializing Components for "${Session.targetName}"`)
    const initStartTime = Timer.getTimer()

    // Init Collection
    let collection = await CollectionFactory.fromName(collectionName, componentNames)

    // Filter Out Components When Applicable
    if (componentNames?.length) {
      logChildItem(`Packaging the following component${plural(componentNames)}: ${componentNames.join(', ')}`)
      collection.components = collection.components.filter(component => componentNames.includes(component.name))
    }

    // Initialize Individual Components
    collection.components = await Promise.all(collection.components.map(component => ComponentFactory.initializeComponent(component)))

    // Create Embedded Snippets from Components
    collection.snippets = this.createEmbeddedSnippets(collection.components)

    logChildItem(`Found ${collection.components.length} component${plural(collection.components)} and  ${collection.snippets.length} snippet${plural(collection.snippets)}.`)

    // Filter Out Snippets When Applicable
    if (componentNames?.length) {
      const allComponents = [...collection.components, ...collection.snippets]
      const allSnippetNames = SnippetUtils.getSnippetNames(allComponents)

      collection.snippets = collection.snippets.filter(snippet => allSnippetNames.includes(snippet.name))
    }

    // Initialize Embedded Snippets
    collection.snippets = await Promise.all(collection.snippets.map(component => ComponentFactory.initializeComponent(component)))

    logChildItem(`Assembling ${collection.components.length} component${plural(collection.components)} and ${collection.snippets.length} snippet${plural(collection.snippets)}.`)

    logChildItem(`Initialization complete (${Timer.getEndTimerInSeconds(initStartTime)} seconds)`)
    logSpacer()

    logTitleItem(`Building Individual Components for ${Session.targetName}`)
    const buildStartTime = Timer.getTimer();

    // Build Components
    [collection.components, collection.snippets] = (await Promise.all([
      Promise.all(collection.components.map(component => ComponentBuilder.build(component))),
      Promise.all(collection.snippets.map(snippet => SnippetBuilder.build(snippet)))
    ]))

    const allSnippets = [...collection.components, ...collection.snippets]

    logChildItem(`Build complete (${Timer.getEndTimerInSeconds(buildStartTime)} seconds)`)
    logSpacer()

    logTitleItem(`Structuring Components Tree for ${Session.targetName}`)
    const treeStartTime = Timer.getTimer()

    // Build Component Hierarchy Structure
    await this.setComponentHierarchy(collection.components, allSnippets)
    await this.setComponentHierarchy(collection.snippets, allSnippets)

    logChildMessage()
    logChildMessage(`${collectionName}/`)

    for (const [i, component] of collection.components.entries()) {
      const last = i === collection.components.length - 1
      this.folderTreeLog(component, last)
    }
    logChildMessage()

    logChildItem(`Tree complete (${Timer.getEndTimerInSeconds(treeStartTime)} seconds)`)
    logSpacer()

    // Build Collection
    logTitleItem('Building Collection')
    const collectionStartTime = Timer.getTimer()
    collection = await CollectionBuilder.build(collection)
    logChildItem(`Collection Build complete (${Timer.getEndTimerInSeconds(collectionStartTime)} seconds)`)
    logSpacer()

    // Total Timer Output
    logTitleItem(`Build Command Total Time: ${Timer.getEndTimerInSeconds(initStartTime)} seconds`)
    logSpacer()
    return Promise.resolve(collection)
  }

  /**
   * Create Embedded Snippets
   * @param {Component[]} components
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
   * @param {Component[]|Snippet[]} topComponents
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
   * @param {Component|Snippet} component
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
   * Deploy Collection
   * @param {module:models/Collection} collection
   * @returns {Promise<void>}
   */
  static async deployCollection (collection) {
    // Deploy Collection To Disk
    logTitleItem('Writing Collection Build To Disk')
    const collectionDeployStartTime = Timer.getTimer()
    await CollectionBuilder.deployToBuildFolder(collection)
    logChildItem(`Build Deployment Complete (${Timer.getEndTimerInSeconds(collectionDeployStartTime)} seconds)`)
    logSpacer()
  }

  /**
   * Watch a Collection
   * @param {module:models/Collection} collection
   * @return {FSWatcher}
   */
  static watchCollection (collection) {
    const ignorePatterns = CollectionUtils.getIgnorePatterns(collection)

    const watcher = Watcher.getWatcher(collection.rootFolder, ignorePatterns)
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
    const componentNames = Session.config?.components

    const collection = await this.buildCollection(collectionName, componentNames)
    await this.deployCollection(collection)
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
