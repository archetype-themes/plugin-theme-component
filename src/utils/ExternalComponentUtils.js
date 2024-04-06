// Internal Dependencies
import { copyFolder, getAbsolutePath, getFolderFilesRecursively } from './FileUtils.js'
import { installRepository } from './GitUtils.js'
import { isGitHubUrl } from './WebUtils.js'
import Timer from '../models/Timer.js'
import { logChildItem } from './LoggerUtils.js'
import { exitWithError } from './NodeUtils.js'

/**
 * Install an external component locally
 * @param {string} sourcePath
 * @param {string} installFolder
 * @return {Promise<string[]>}
 */
export async function install(sourcePath, installFolder) {
  if (isGitHubUrl(sourcePath)) {
    await installRepository(sourcePath, installFolder)
  } else {
    const fullPath = getAbsolutePath(sourcePath)
    await copyFolder(fullPath, installFolder, { recursive: true })
  }

  return getFolderFilesRecursively(installFolder)
}

/**
 * Install Components Locally
 * @param {string} sourcePath
 * @param {string} installPath
 * @return {Promise<void>}
 */
export async function installComponents(sourcePath, installPath) {
  try {
    const timer = new Timer()
    logChildItem(`Installing Components`)
    await install(sourcePath, installPath)
    logChildItem(`Done (${timer.now()} seconds)`)
  } catch (error) {
    exitWithError('Components Files or Repository Access Error: ' + error.message)
  }
}

/**
 * Install Locales Locally
 * @param sourcePath
 * @param installPath
 * @return {Promise<void>}
 */
export async function installLocales(sourcePath, installPath) {
  try {
    const timer = new Timer()
    logChildItem(`Installing Locales Database`)
    await install(sourcePath, installPath)
    logChildItem(`Done (${timer.now()} seconds)`)
  } catch (error) {
    exitWithError('Locales Files or Repository Access Error: ' + error.message)
  }
}

/**
 * Install Theme Files Locally
 * @param sourcePath
 * @param installPath
 * @return {Promise<void>}
 */
export async function installThemeFiles(sourcePath, installPath) {
  try {
    const timer = new Timer()
    logChildItem(`Installing Theme Files`)
    await install(sourcePath, installPath)
    logChildItem(`Done (${timer.now()} seconds)`)
  } catch (error) {
    exitWithError('Source Theme Files or Repository Access Error: ' + error.message)
  }
}
