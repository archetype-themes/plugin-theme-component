// External Dependencies
import { join } from 'node:path'

// Internal Dependencies
import { FileTypes } from '../config/constants.js'
import { collectionBuildFactory } from '../factory/collectionBuildFactory.js'
import Timer from '../models/Timer.js'
import Session from '../models/static/Session.js'
import PostCSSProcessor from '../processors/PostCSSProcessor.js'
import { getFiles } from '../utils/fileUtils.js'
import { error, fatal, logChildItem, logSpacer, logTitleItem, warn } from '../utils/logger.js'
import { ChangeType } from '../utils/Watcher.js'
import ImportMapProcessor from '../processors/ImportMapProcessor.js'
import { plural } from '../utils/textUtils.js'
import ComponentBuild from '../models/ComponentBuild.js'
import { getCopyright } from '../utils/copyright.js'

/**
 * Execute Collection Build Process
 * @param collection
 * @returns {Promise<Awaited<Collection|module:models/Collection>>}
 */
export async function buildCollection(collection) {
  logTitleItem(`Building Components For "${collection.name}"`)
  const buildTimer = new Timer()

  logChildItem(
    `Building ${collection.components.length + collection.snippets.length} Individual Component${plural(collection.components)} And Snippet${plural(collection.snippets)} for "${collection.name}"`
  )
  const individualBuildTimer = new Timer()

  // Build Components Individually
  ;[collection.components, collection.snippets] = await Promise.all([
    Promise.all(
      collection.components.map((component) => buildComponent(component, collection.rootFolder, collection.copyright))
    ),
    Promise.all(
      collection.snippets.map((snippet) => buildComponent(snippet, collection.rootFolder, collection.copyright))
    )
  ])

  logChildItem(`Individual Build Done (${individualBuildTimer.now()} seconds)`)

  // Build Collection
  logChildItem('Running Processors')
  const collectionAssemblyTimer = new Timer()
  collection = await runProcessors(collection)
  logChildItem(`Processors Done (${collectionAssemblyTimer.now()} seconds)`)

  // Total Timer Output
  logChildItem(`Build Done (${buildTimer.now()} seconds)`)
  logSpacer()
  return Promise.resolve(collection)
}

/**
 * Build Collection
 * @param {module:models/Collection} collection
 * @returns {Promise<module:models/Collection>}
 */
async function runProcessors(collection) {
  collection.build = collectionBuildFactory(collection)

  if (Session.firstRun) {
    [collection.build.importMap, collection.build.locales, collection.build.styles] = await Promise.all([
      buildJavaScript(collection.jsIndexes, collection.rootFolder),
      buildStyles(collection.mainStylesheets, collection.copyright)
    ])
  } else {
    switch (Session.changeType) {
      case ChangeType.JavaScript:
        collection.build.importMap = await buildJavaScript(collection.jsIndexes, collection.rootFolder)
        break
      case ChangeType.Stylesheet:
        collection.build.styles = await buildStyles(collection.mainStylesheets, collection.build.stylesheet)
        break
      case ChangeType.Liquid:
        collection.build.styles = await buildStyles(collection.mainStylesheets, collection.build.stylesheet)
        break
    }
  }

  return collection
}

/**
 * Build An Individual Component
 * @param {Component} component
 * @param {string} collectionRootFolder
 * @param {string} [copyright] copyright Text
 * @returns {Promise<Component>}
 */
async function buildComponent(component, collectionRootFolder, copyright) {
  // Create the component build model
  component.build = new ComponentBuild()

  // Build Liquid Code
  component.build.liquidCode = component.liquidCode
  if (copyright) {
    component.build.liquidCode = getCopyright(FileTypes.Liquid, copyright) + component.build.liquidCode
  }

  return component
}

/**
 * Builds JavaScript files for the given collection and components.
 * @param {string[]} jsFiles - JavaScript Files
 * @param {string} cwd - The working directory.
 * @returns {Promise<{entries: Map<string, string>, tags: string}>}
 */
async function buildJavaScript(jsFiles, cwd) {
  if (jsFiles.length) {
    logChildItem('Starting The Import Map Processor', 1)
    const timer = new Timer()
    const importMap = await ImportMapProcessor.build(jsFiles, cwd)
    logChildItem(`Import Map Processor Done (${timer.now()} seconds)`, 1)
    return importMap
  } else {
    warn('No Javascript Files Found. Import Map Build Process Was Skipped.')
  }
}

/**
 * Builds the styles for the given collection and all components.
 * @param {string[]} mainStylesheets - Main Stylesheets
 * @param {string} [copyright] - The collection's Copyright Text
 * @returns {Promise<string>} - A promise that resolves when the styles are built.
 */
async function buildStyles(mainStylesheets, copyright) {
  if (mainStylesheets.length) {
    logChildItem('Starting The Styles Processor', 1)
    const timer = new Timer()

    let styles = await PostCSSProcessor.buildStylesBundle(mainStylesheets)
    styles = getCopyright(FileTypes.Css, copyright) + styles
    logChildItem(`Styles Processor Done (${timer.now()} seconds)`, 1)
    return styles
  }
}
