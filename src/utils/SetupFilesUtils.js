import { join, sep } from 'node:path'
import { SETUP_FOLDER_NAME } from '../config/Components.js'
import { updateFile } from './Watcher.js'
import { copyFile } from 'node:fs/promises'

const setupFolderCue = join(sep, SETUP_FOLDER_NAME, sep)

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
