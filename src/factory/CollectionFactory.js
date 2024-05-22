// External Dependencies
import { basename, join } from 'node:path'

// Internal Dependencies
import Collection from '../models/Collection.js'
import { validateComponentNames, loadComponents, loadSnippets } from '../utils/CollectionUtils.js'
import { cwd } from 'node:process'
import { logChildItem, logSpacer, logTitleItem } from '../utils/LoggerUtils.js'
import Timer from '../models/Timer.js'
import { plural } from '../utils/SyntaxUtils.js'
import { exists, getFolders } from '../utils/FileUtils.js'
import { COMPONENTS_FOLDER } from '../config/Components.js'
import FileMissingError from '../errors/FileMissingError.js'
import Component from '../models/Component.js'
import InternalError from '../errors/InternalError.js'

class CollectionFactory {
  /**
   * Create Collection Model From CWD (Current Working Directory)
   * @param {string[]} [componentNames] - List of Components To Bundle With The Collection
   * @return {Promise<module:models/Collection>}
   */
  static async fromCwd(componentNames) {
    return CollectionFactory.fromPath(basename(cwd()), cwd(), componentNames)
  }

  /**
   * Create Collection Model From A Remote Path
   * This will attempt to download a copy of a remote repository if the path is not local
   * @param {string} name
   * @param {string} path
   * @param {string[]} [componentNames]
   * @return {module:models/Collection}
   */
  static async fromPath(name, path, componentNames) {
    logTitleItem(`Initializing Components for "${name}"`)
    const initStartTime = new Timer()

    const collection = new Collection()
    collection.name = name
    collection.rootFolder = path

    // Find .gitignore File
    const gitignoreFile = join(collection.rootFolder, '.gitignore')
    if (await exists(gitignoreFile)) {
      collection.gitIgnoreFile = gitignoreFile
    }

    // Find and Create components
    collection.components = await findComponents(collection.rootFolder)

    // Load the components' data
    collection.components = await loadComponents(collection.components)

    collection.snippets = await loadSnippets(collection.components)

    // Display Total Available Count of Components & Snippets
    logChildItem(
      `Found ${collection.components.length} component${plural(collection.components)} and  ${collection.snippets.length} snippet${plural(collection.snippets)}.`
    )

    if (componentNames?.length) {
      collection.componentNames = validateComponentNames(collection.allComponents, componentNames)

      collection.components = filterComponents(collection.components, collection.componentNames)
      collection.snippets = filterSnippets(collection.snippets, collection.componentNames)
    }

    // Throw an Error when No Components are found
    if (collection.components.length + collection.snippets.length === 0) {
      throw new InternalError(`No matching components found for [${collection.componentNames.join(',')}]`)
    }

    logChildItem(
      `Packaging the following component${plural(collection.componentNames)}: ${[...collection.componentNames].join(', ')}`
    )

    logChildItem(`Initialization complete (${initStartTime.now()} seconds)`)
    logSpacer()

    return collection
  }
}

/**
 * Init Collection Components
 * @param {string} collectionRootFolder
 * @return {Promise<Component[]>}
 */
async function findComponents(collectionRootFolder) {
  // Find All component Folders
  const componentFolders = await findComponentsFolders(collectionRootFolder)

  // Create Components From components Folders
  return initComponents(componentFolders)
}

/**
 * Get Collection's Component Folders
 * @param {string} collectionRootFolder
 * @returns {Promise<string[]>}
 */
async function findComponentsFolders(collectionRootFolder) {
  const componentsFolder = join(collectionRootFolder, COMPONENTS_FOLDER)
  if (!(await exists(componentsFolder))) {
    throw new FileMissingError(`Unable to locate components folder ${componentsFolder}`)
  }
  return getFolders(join(collectionRootFolder, COMPONENTS_FOLDER))
}

/**
 * Filter Components By Name
 * @param {Component[]} components - An array of Component instances
 * @param {Set<string>} componentNames - A set of component names to filter by
 * @returns {Component[]}
 */
function filterComponents(components, componentNames) {
  return components.filter((component) => componentNames.has(component.name))
}

/**
 * Filter Snippets By Name
 * @param {Snippet[]} snippets - An array of Snippet instances
 * @param {Set<string>} componentNames - A set of component names to filter by
 * @returns {Snippet[]}
 */
function filterSnippets(snippets, componentNames) {
  return snippets.filter((snippet) => componentNames.has(snippet.name))
}

/**
 * Find Components From package.json files
 * @param {string[]} componentFolders
 * @returns {Component[]}
 */
function initComponents(componentFolders) {
  const components = []

  for (const componentFolder of componentFolders) {
    const componentName = componentFolder.split('/').pop()
    components.push(new Component(componentName, componentFolder))
  }

  return components
}

export default CollectionFactory
