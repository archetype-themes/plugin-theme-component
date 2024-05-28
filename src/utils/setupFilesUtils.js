// External Dependencies
import { basename, join, sep } from 'node:path'

// Internal Dependencies
import {
  JSON_EXTENSION,
  SETUP_FOLDER_NAME,
  TEMPLATES_FOLDER_NAME,
  THEME_INDEX_TEMPLATE_LIQUID_FILE
} from '../config/constants.js'
import { handleWatcherEvent } from './Watcher.js'
import { copyFileAndCreatePath, getFileContents } from './fileUtils.js'

const setupFolderCue = join(sep, SETUP_FOLDER_NAME, sep)
const templatesFolderCue = join(sep, TEMPLATES_FOLDER_NAME, sep)

/**
 * Get Setup folder relative path from an absolute path
 * @param {string} filePath
 * @returns {string}
 */
function getSetupRelativePath(filePath) {
  const setupFileRelativePathPos = filePath.indexOf(setupFolderCue) + setupFolderCue.length
  return filePath.substring(setupFileRelativePathPos)
}

/**
 * Initial Installation Of Setup Files
 * @param {Component[]} components
 * @param {string} installFolder
 * @return {Promise<void[]>}
 */
export async function installSetupFiles(components, installFolder) {
  const copyPromises = []
  components.forEach((component) => {
    component.files.setupFiles.forEach((setupFile) => {
      const setupFileRelativePath = getSetupRelativePath(setupFile)
      const installPath = join(installFolder, setupFileRelativePath)
      copyPromises.push(copyFileAndCreatePath(setupFile, installPath))
    })
  })
  return Promise.all(copyPromises)
}

/**
 * Update Setup File after a watcher event
 * @param {string} componentsFolder
 * @param {string} themeFolder
 * @param {string} event Watcher Event Name
 * @param {string} eventPath Watcher Event Path
 * @returns {Promise<void>}
 */
export async function handleSetupFileWatcherEvent(componentsFolder, themeFolder, event, eventPath) {
  const source = join(componentsFolder, eventPath)
  const setupFileRelativePath = getSetupRelativePath(eventPath)
  const targetPath = join(themeFolder, setupFileRelativePath)

  return handleWatcherEvent(event, eventPath, source, targetPath)
}

/**
 * Generate Index Liquid Template
 * @param {Component[]} components
 */
export function getComponentsListPerCategory(components) {
  const categories = []
  const names = []
  const templates = []

  components.forEach((component) => {
    component.files.setupFiles.forEach((setupFile) => {
      const templateFolderIndex = setupFile.indexOf(templatesFolderCue)
      if (templateFolderIndex !== -1 && setupFile.endsWith(JSON_EXTENSION)) {
        const templatePath = setupFile.substring(templateFolderIndex + templatesFolderCue.length)
        const filename = basename(setupFile, JSON_EXTENSION)
        const category = templatePath.substring(0, templatePath.indexOf('.'))

        categories.push(category)
        names.push(component.name)
        templates.push(filename.split('.')[1])
      }
    })
  })

  return `
    {% assign component_names = "${names.join(',')}" | split: ',' %}
    {% assign template_files = "${templates.join(',')}" | split: ',' %}
    {% assign component_categories = "${categories.join(',')}" | split: ','%}
  `
}

/**
 * Build Index Template
 * @param {Component[]} components
 * @param {string} themeFolder
 * @returns {Promise<string>}
 */
export async function buildIndexTemplate(components, themeFolder) {
  const liquidVars = getComponentsListPerCategory(components)
  const indexTemplatePath = join(themeFolder, THEME_INDEX_TEMPLATE_LIQUID_FILE)
  const indexTemplate = await getFileContents(indexTemplatePath)
  return indexTemplate.replace('<!-- components-list-vars -->', liquidVars)
}
