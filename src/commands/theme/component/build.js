// External Dependencies
import { ux } from '@oclif/core'

// Internal Dependencies
import CollectionBuilder from '../../../builders/CollectionBuilder.js'
import ComponentBuilder from '../../../builders/ComponentBuilder.js'
import SnippetBuilder from '../../../builders/SnippetBuilder.js'
import { BaseCommand } from '../../../config/baseCommand.js'
import Timer from '../../../models/Timer.js'
import { logChildItem, logChildMessage, logSpacer, logTitleItem } from '../../../utils/LoggerUtils.js'
import { plural } from '../../../utils/SyntaxUtils.js'

class Build extends BaseCommand {
  static hidden = true // Hide the command from help

  /**
   * Build a Collection
   * @param {module:models/Collection} collection Collection
   * @throws InternalError - No components found
   * @return {Promise<module:models/Collection>}
   */
  static async buildCollection(collection) {
    logTitleItem(`Initializing Components Build for "${collection.name}"`)
    const initStartTime = new Timer()

    logTitleItem(
      `Assembling ${collection.components.length} component${plural(collection.components)} and ${collection.snippets.length} snippet${plural(collection.snippets)}.`
    )

    logSpacer()

    logTitleItem(`Building Individual Components for ${collection.name}`)
    const buildStartTime = new Timer()

    // Build Components
    ;[collection.components, collection.snippets] = await Promise.all([
      Promise.all(collection.components.map((component) => ComponentBuilder.build(component, collection.rootFolder))),
      Promise.all(collection.snippets.map((snippet) => SnippetBuilder.build(snippet, collection.rootFolder)))
    ])

    logChildItem(`Build complete (${buildStartTime.now()} seconds)`)
    logSpacer()

    logTitleItem('Components Tree')
    const treeStartTime = new Timer()

    // Build Component Hierarchy Structure
    await this.setComponentHierarchy(collection.components, collection.allComponents)
    await this.setComponentHierarchy(collection.snippets, collection.allComponents)

    logChildMessage()
    logChildMessage(`${collection.name}/`)

    let filteredComponents = collection.components.filter((component) => component.name.startsWith('section'))
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
   * Attach Child Components
   * @param {Component[]|Snippet[]} topComponents
   * @param {(Component|Snippet)[]} availableComponents
   */
  static async setComponentHierarchy(topComponents, availableComponents) {
    for (const topComponent of topComponents) {
      if (!topComponent.snippets?.length && topComponent.snippetNames?.length) {
        for (const snippetName of topComponent.snippetNames) {
          const snippet = availableComponents.find((component) => component.name === snippetName)
          if (snippet !== undefined) {
            topComponent.snippets.push(snippet)
          } else {
            ux.error(`Unable to find component "${snippetName}" requested from a render tag in "${topComponent.name}".`)
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
  static folderTreeLog(component, last = false, grid = []) {
    const ascii = last ? '└──' : '├──'

    let prefix = ''
    grid.forEach((gridItem) => {
      prefix += gridItem ? '│    ' : '     '
    })

    logChildMessage(`${prefix}${ascii} ${component.name}`)

    // Removing icons from the list
    const filteredSnippets = component.snippets.filter((component) => !component.isSvg())
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
  static async deployCollection(collection) {
    // Deploy Collection To Disk
    logTitleItem('Writing Collection Build To Disk')
    const timer = new Timer()
    await CollectionBuilder.deployToBuildFolder(collection)
    logChildItem(`Build Deployment Complete (${timer.now()} seconds)`)
    logSpacer()
  }
}

export default Build
