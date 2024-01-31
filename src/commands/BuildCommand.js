// Node imports
import path, { dirname, parse } from 'node:path'
import Components from '../config/Components.js'
import InternalError from '../errors/InternalError.js'
import CollectionFactory from '../factory/CollectionFactory.js'
import ComponentFactory from '../factory/ComponentFactory.js'
import Snippet from '../models/Snippet.js'
import Session from '../models/static/Session.js'
import CollectionUtils from '../utils/CollectionUtils.js'
import logger, { logChildItem, logChildMessage, logSpacer, logTitleItem } from '../utils/Logger.js'

// Internal Imports
import { plural } from '../utils/SyntaxUtils.js'
import Timer from '../models/Timer.js'
import Watcher from '../utils/Watcher.js'
import CollectionBuilder from './runners/CollectionBuilder.js'
import ComponentBuilder from './runners/ComponentBuilder.js'
import SnippetBuilder from './runners/SnippetBuilder.js'

class BuildCommand {
  /**
   * Execute Build Command
   * @returns {Promise<FSWatcher|null>}
   */
  static async execute () {
    const collectionName = Session.config.name
    let componentNames
    if (Session.targetType === Components.COLLECTION_TYPE_NAME) {
      componentNames = Session.config?.components
    } else if (Session.targetType === Components.COMPONENT_TYPE_NAME) {
      componentNames = [Session.targets]
    }

    const collection = await CollectionFactory.fromName(collectionName, componentNames)
    await this.buildCollection(collection)
    await this.deployCollection(collection)

    if (Session.watchMode) {
      Session.firstRun = false
      return this.watchCollection(collection)
    }

    return null
  }

  /**
   * Build a Collection
   * @param {module:models/Collection} collection Collection
   * @throws InternalError - No components found
   * @return {Promise<module:models/Collection>}
   */
  static async buildCollection (collection) {
    // If this is a Theme, the Current Target Name will always be the Collection Name.
    // Let's use that instead of Session.targets which might contain a Collection List object.
    /** @type {string} **/
    const currentTargetName = Session.callerType === Components.THEME_TYPE_NAME ? collection.name : Session.targets

    logTitleItem(`Initializing Components for "${currentTargetName}"`)
    const initStartTime = new Timer()

    // Initialize Individual Components
    collection.components = await Promise.all(collection.components.map(component => ComponentFactory.initializeComponent(component)))

    // Create Embedded Snippets Skeleton from Components
    collection.snippets = this.createEmbeddedSnippets(collection.components)
    // Initialize Embedded Snippets
    collection.snippets = await Promise.all(collection.snippets.map(snippet => ComponentFactory.initializeComponent(snippet)))

    const allComponents = collection.allComponents

    // Display Total Available Count of Components & Snippets
    logChildItem(`Found ${collection.components.length} component${plural(collection.components)} and  ${collection.snippets.length} snippet${plural(collection.snippets)}.`)

    // Filter Out Components When Applicable
    if (collection.componentNames?.length) {
      // for each component, get tree item names
      const componentNamesToBuild = CollectionUtils.getComponentsNameTree(allComponents, collection.componentNames)

      logChildItem(`Packaging the following component${plural(collection.componentNames)}: ${collection.componentNames.join(', ')}`)

      collection.components = collection.components.filter(component => componentNamesToBuild.has(component.name))
      collection.snippets = collection.snippets.filter(snippet => componentNamesToBuild.has(snippet.name))
    }

    // Throw an Error when No Components are found
    if (collection.components.length + collection.snippets.length === 0) {
      throw new InternalError(`No matching components found for [${collection.componentNames.join(',')}]`)
    }

    logChildItem(`Initialization complete (${initStartTime.now()} seconds)`)
    logSpacer()

    logTitleItem(`Assembling ${collection.components.length} component${plural(collection.components)} and ${collection.snippets.length} snippet${plural(collection.snippets)}.`)

    logSpacer()

    logTitleItem(`Building Individual Components for ${currentTargetName}`)
    const buildStartTime = new Timer();

    // Build Components
    [collection.components, collection.snippets] = (await Promise.all([
      Promise.all(collection.components.map(component => ComponentBuilder.build(component, collection.rootFolder))),
      Promise.all(collection.snippets.map(snippet => SnippetBuilder.build(snippet, collection.rootFolder)))
    ]))

    logChildItem(`Build complete (${buildStartTime.now()} seconds)`)
    logSpacer()

    logTitleItem('Components Tree')
    const treeStartTime = new Timer()

    // Build Component Hierarchy Structure
    await this.setComponentHierarchy(collection.components, allComponents)
    await this.setComponentHierarchy(collection.snippets, allComponents)

    logChildMessage()
    logChildMessage(`${collection.name}/`)

    let filteredComponents = collection.components.filter(component => component.name.startsWith('section'))
    if (!filteredComponents.length > 0) {
      filteredComponents = collection.components
    }

    for (const [i, component] of filteredComponents.entries()) {
      const last = i === filteredComponents.length - 1
      this.folderTreeLog(component, last)
    }
    logChildMessage()

    logChildItem(`Tree complete (${treeStartTime.now()} seconds)`)
    logSpacer()

    // Build Collection
    logTitleItem('Building Collection')
    const collectionStartTime = new Timer()
    collection = await CollectionBuilder.build(collection)
    logChildItem(`Collection Build complete (${collectionStartTime.now()} seconds)`)
    logSpacer()

    // Total Timer Output
    logTitleItem(`Build Command Total Time: ${initStartTime.now()} seconds`)
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
          } else {
            logger.error(`Unable to find component "${snippetName}" requested from a render tag in "${topComponent.name}".`)
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

    // Removing icons from the list
    const filteredSnippets = component.snippets.filter(component => !component.isSvg())
    if (filteredSnippets.length) {
      grid.push(!last)
      for (const [i, snippet] of filteredSnippets.entries()) {
        const lastChild = i === filteredSnippets.length - 1
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
    const timer = new Timer()
    await CollectionBuilder.deployToBuildFolder(collection)
    logChildItem(`Build Deployment Complete (${timer.now()} seconds)`)
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

    const collectionName = Session.config.name
    const componentNames = Session.config?.components

    const collection = await CollectionFactory.fromName(collectionName, componentNames)
    await this.buildCollection(collection)
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
