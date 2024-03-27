// External Dependencies
import { access, copyFile, mkdir } from 'node:fs/promises'
import { basename, join, sep, dirname } from 'node:path'

// Internal Dependencies
import { SETUP_FOLDER_NAME, TEMPLATES_FOLDER_NAME } from '../config/Components.js'
import { handleWatcherEvent } from './Watcher.js'
import { JSON_EXTENSION } from './ComponentFilesUtils.js'
import { ucFirst } from './SyntaxUtils.js'
import { saveFile } from './FileUtils.js'

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
  async function isExists(path) {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  };

  async function copyFileAndMakeFolder(setupFile, installPath) {
    const exist = await isExists(dirname(installPath));
    if (!exist) {
      await mkdir(dirname(installPath), {recursive: true});
    }
    
    return copyFile(setupFile, installPath)
  }

  const copyPromises = []
  components.forEach((component) => {
    component.files.setupFiles.forEach((setupFile) => {
      const setupFileRelativePath = getSetupRelativePath(setupFile)
      const installPath = join(installFolder, setupFileRelativePath)
      copyPromises.push(copyFileAndMakeFolder(setupFile, installPath))
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

/**
 * Write Index Template
 * @param {Component[]} components
 * @param {string} themeFolder
 * @returns {Promise<void>}
 */
export async function createIndexTemplate(components, themeFolder) {
  const indexTemplateContents = generateIndexTemplate(components)
  const indexTemplatePath = join(themeFolder, TEMPLATES_FOLDER_NAME, 'index.liquid')
  return saveFile(indexTemplatePath, indexTemplateContents)
}
