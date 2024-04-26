// External Dependencies
import { basename, join, sep } from 'node:path'

// Internal Dependencies
import { SETUP_FOLDER_NAME, TEMPLATES_FOLDER_NAME } from '../config/Components.js'
import { handleWatcherEvent } from './Watcher.js'
import { JSON_EXTENSION } from './ComponentFilesUtils.js'
import { copyFileAndCreatePath, getFileContents, saveFile } from './FileUtils.js'

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
  const componentsList = {}

  components.forEach((component) => {
    component.files.setupFiles.forEach((setupFile) => {
      if (setupFile.indexOf(templatesFolderCue) !== -1 && setupFile.endsWith(JSON_EXTENSION)) {
        const filename = basename(setupFile, JSON_EXTENSION)
        const category = filename.substring(0, filename.indexOf('.'))
        if (!componentsList[category]) componentsList[category] = {}
        componentsList[category][component.name] = filename
      }
    })
  })

  const categories = []
  const templates = []
  const names = []
  for (const category in componentsList) {
    for (const [componentName, templateFile] of Object.entries(componentsList[category])) {
      categories.push(category)
      templates.push(templateFile.split('.')[1])
      names.push(componentName)
    }
  }

  return `
    {% assign component_names = "${names.join(',')}" | split: ',' %}
    {% assign template_files = "${templates.join(',')}" | split: ',' %}
    {% assign component_categories = "${categories.join(',')}" | split: ','%}
  `
}

/**
 * Write Index Template
 * @param {Component[]} components
 * @param {string} themeFolder
 * @returns {Promise<void>}
 */
export async function createIndexTemplate(components, themeFolder) {
  const liquidVars = getComponentsListPerCategory(components)
  const indexTemplatePath = join(themeFolder, TEMPLATES_FOLDER_NAME, 'index.liquid')
  let indexTemplate = await getFileContents(indexTemplatePath)
  indexTemplate = indexTemplate.replace('<!-- components-list-vars -->', liquidVars)
  return saveFile(indexTemplatePath, indexTemplate)
}
