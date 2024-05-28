// Internal Dependencies
import CollectionBuilder from '../../../builders/CollectionBuilder.js'
import ComponentBuilder from '../../../builders/ComponentBuilder.js'
import SnippetBuilder from '../../../builders/SnippetBuilder.js'
import { BaseCommand } from '../../../config/baseCommand.js'
import Timer from '../../../models/Timer.js'
import { logChildItem, logSpacer, logTitleItem } from '../../../utils/LoggerUtils.js'
import { plural } from '../../../utils/TextUtils.js'

class Build extends BaseCommand {
  static hidden = true // Hide the command from help

  /**
   * Build a Collection
   * @param {module:models/Collection} collection Collection
   * @throws InternalError - No components found
   * @return {Promise<module:models/Collection>}
   */
  static async buildCollection(collection) {
    logTitleItem(`Building Components For "${collection.name}"`)
    const buildTimer = new Timer()

    logChildItem(
      `Building ${collection.components.length + collection.snippets.length} Individual Component${plural(collection.components)} And Snippet${plural(collection.snippets)} for "${collection.name}"`
    )
    const individualBuildTimer = new Timer()

    // Build Components Individually
    ;[collection.components, collection.snippets] = await Promise.all([
      Promise.all(
        collection.components.map((component) =>
          ComponentBuilder.build(component, collection.rootFolder, collection.copyright)
        )
      ),
      Promise.all(
        collection.snippets.map((snippet) => SnippetBuilder.build(snippet, collection.rootFolder, collection.copyright))
      )
    ])

    logChildItem(`Individual Build Done (${individualBuildTimer.now()} seconds)`)

    // Build Collection
    logChildItem('Running Processors')
    const collectionAssemblyTimer = new Timer()
    collection = await CollectionBuilder.runProcessors(collection)
    logChildItem(`Processors Done (${collectionAssemblyTimer.now()} seconds)`)

    // Total Timer Output
    logChildItem(`Build Done (${buildTimer.now()} seconds)`)
    logSpacer()
    return Promise.resolve(collection)
  }
}

export default Build
