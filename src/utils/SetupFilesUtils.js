// External Dependencies
import { copyFile } from 'node:fs/promises'
import { basename, join, sep } from 'node:path'

// Internal Dependencies
import { SETUP_FOLDER_NAME, TEMPLATES_FOLDER_NAME } from '../config/Components.js'
import { updateFile } from './Watcher.js'
import { JSON_EXTENSION } from './ComponentFilesUtils.js'
import { ucFirst } from './SyntaxUtils.js'

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
 * @param {string} installFolder
 * @param {Component[]} components
 * @return {Promise<void[]>}
 */
export async function installSetupFiles(installFolder, components) {
  const copyPromises = []
  components.forEach((component) => {
    component.files.setupFiles.forEach((setupFile) => {
      const setupFileRelativePath = getSetupRelativePath(setupFile)
      const installPath = join(installFolder, setupFileRelativePath)
      copyPromises.push(copyFile(setupFile, installPath))
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
export async function updateSetupFile(componentsFolder, themeFolder, event, eventPath) {
  const source = join(componentsFolder, eventPath)
  const setupFileRelativePath = getSetupRelativePath(eventPath)
  const targetPath = join(themeFolder, setupFileRelativePath)

  return updateFile(event, eventPath, source, targetPath)
}

/**
 * Generate Index Liquid Template
 * @param {Component[]} components
 */
export function generateIndexTemplate(components) {
  const jsonTemplates = {}

  components.forEach((component) => {
    component.files.setupFiles.forEach((setupFile) => {
      if (setupFile.indexOf(templatesFolderCue) !== -1 && setupFile.endsWith(JSON_EXTENSION)) {
        const filename = basename(setupFile, JSON_EXTENSION)
        const category = filename.substring(0, filename.indexOf('.'))
        if (!jsonTemplates[category]) jsonTemplates[category] = {}
        jsonTemplates[category][component.name] = filename
      }
    })
  })

  let templateBody = ''
  for (const category in jsonTemplates) {
    const route = category === 'index' ? 'routes.root_url' : category + '.url'

    if (category !== 'index') templateBody += `\n\t{% if ${category} %}`
    templateBody += `\n\t<h2>${ucFirst(category)} views</h2>`
    templateBody += `\n\t\t<ul>`
    for (const [componentName, templateFile] of Object.entries(jsonTemplates[category])) {
      templateBody += `\n\t\t\t<li><a href="{{ ${route} }}?view=${templateFile.split('.')[1]}">${componentName}</a></li>`
    }
    templateBody += `\n\t\t</ul>`
    if (category !== 'index') templateBody += `\n\t{% endif %}`
  }

  return `
{% liquid
  assign collection = collections['all']
  assign product = collection.products | last
%}
<div className="page-width">
  <h1>Component Directory</h1>
${templateBody}
</div>
`
}
