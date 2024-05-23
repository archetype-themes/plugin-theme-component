// External Dependencies
import { join } from 'node:path'

// Internal Dependencies
import Collection from '../models/Collection.js'
import { validateComponentNames } from '../utils/CollectionUtils.js'
import { fatal, logChildItem, logTitleItem } from '../utils/LoggerUtils.js'
import Timer from '../models/Timer.js'
import { plural } from '../utils/SyntaxUtils.js'
import { exists, getFolders } from '../utils/FileUtils.js'
import { COMPONENTS_FOLDER } from '../config/Components.js'
import FileMissingError from '../errors/FileMissingError.js'
import InternalError from '../errors/InternalError.js'
import { componentFactory } from './ComponentFactory.js'
import { snippetFactory } from './snippetFactory.js'

/**
 * Create Collection Model From A Remote Path
 * This will attempt to download a copy of a remote repository if the path is not local
 * @param {string} name - Collection Name
 * @param {string} path - Collection Path
 * @param {string[]} [componentNames] - Selected Components to Package
 * @return {Promise<module:models/Collection>}
 */
export async function collectionFactory(name, path, componentNames) {
  logTitleItem(`Loading Components For "${name}"`)
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

  collection.snippets = await createSnippetsFromComponents(collection.components)

  // Display Total Available Count of Components & Snippets
  logChildItem(
    `Found ${collection.components.length} component${plural(collection.components)} and  ${collection.snippets.length} snippet${plural(collection.snippets)}.`
  )

  if (componentNames?.length) {
    collection.componentNames = validateComponentNames(collection.allComponents, componentNames)

    collection.components = filterComponents(collection.components, collection.componentNames)
    collection.snippets = filterSnippets(collection.snippets, collection.componentNames)

    logChildItem(
      `Packaging the following component${plural(collection.componentNames)}: ${[...collection.componentNames].join(', ')}`
    )
  }

  // Throw an Error when No Components are found
  if (collection.components.length + collection.snippets.length === 0) {
    throw new InternalError(`No matching components found for "${collection.name}".`)
  }

  // Build Component Hierarchy Structure
  await setComponentHierarchy(collection.components, collection.allComponents)
  await setComponentHierarchy(collection.snippets, collection.allComponents)

  logChildItem(`Done (${initStartTime.now()} seconds)`)

  return collection
}

/**
 * Init Collection Components
 * @param {string} collectionRootFolder
 * @return {Promise<Component[]>}
 */
async function findComponents(collectionRootFolder) {
  // Find All component Folders
  const componentFolders = await findComponentFolders(collectionRootFolder)

  // Create Components From components Folders
  const components = []

  for (const componentFolder of componentFolders) {
    const componentName = componentFolder.split('/').pop()
    components.push(await componentFactory(componentName, componentFolder))
  }

  return components
}

/**
 * Get Collection's Component Folders
 * @param {string} collectionRootFolder
 * @returns {Promise<string[]>}
 */
async function findComponentFolders(collectionRootFolder) {
  const componentsFolder = join(collectionRootFolder, COMPONENTS_FOLDER)
  if (!(await exists(componentsFolder))) {
    throw new FileMissingError(`Unable to locate components folder ${componentsFolder}`)
  }
  return getFolders(join(collectionRootFolder, COMPONENTS_FOLDER))
}

/**
 * Create Snippets From Components
 * @param {Component[]} components
 * @return {Promise<Awaited<Snippet>[]>}
 */
async function createSnippetsFromComponents(components) {
  const componentsWithSnippet = components.filter((component) => component.files?.snippetFiles)
  const snippetPromises = []
  for (const component of componentsWithSnippet) {
    for (const snippetFile of component.files.snippetFiles) {
      snippetPromises.push(snippetFactory(snippetFile))
    }
  }

  return Promise.all(snippetPromises)
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
 * Attach Child Components
 * @param {Component[]|Snippet[]} topComponents
 * @param {(Component|Snippet)[]} availableComponents
 */
async function setComponentHierarchy(topComponents, availableComponents) {
  for (const topComponent of topComponents) {
    if (!topComponent.snippets?.length && topComponent.snippetNames?.length) {
      for (const snippetName of topComponent.snippetNames) {
        const snippet = availableComponents.find((component) => component.name === snippetName)
        if (snippet !== undefined) {
          topComponent.snippets.push(snippet)
        } else {
          fatal(`Unable to find component "${snippetName}" requested from a render tag in "${topComponent.name}".`)
        }
      }
    }
  }
}
