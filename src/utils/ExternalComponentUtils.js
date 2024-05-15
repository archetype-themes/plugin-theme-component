// Internal Dependencies
import { copyFolder, getAbsolutePath, getFolderFilesRecursively } from './FileUtils.js'
import { downloadRepository, isGitHubUrl } from './GitUtils.js'
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
    const downloadFolder = await downloadRepository(sourcePath)
    await copyFolder(downloadFolder, installFolder, { recursive: true })
  } else {
    const fullPath = getAbsolutePath(sourcePath)
    await copyFolder(fullPath, installFolder, { recursive: true })
  }

  return getFolderFilesRecursively(installFolder)
}

/**
 * Download Components Repo
 * @param {string} sourcePath
 * @return {Promise<string>}
 */
export async function downloadComponents(sourcePath) {
  const timer = new Timer()
  logChildItem(`Installing Components`)
  try {
    const downloadFolder = await downloadRepository(sourcePath)
    logChildItem(`Done (${timer.now()} seconds)`)
    return downloadFolder
  } catch (error) {
    exitWithError('Components Files or Repository Access Error: ' + error.message)
  }
}

/**
 * Download Locales Repo
 * @param sourcePath
 * @return {Promise<string>}
 */
export async function downloadLocales(sourcePath) {
  const timer = new Timer()
  logChildItem(`Installing Locales Database`)
  try {
    const downloadFolder = await downloadRepository(sourcePath)
    logChildItem(`Done (${timer.now()} seconds)`)
    return downloadFolder
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
  const timer = new Timer()
  logChildItem(`Installing Theme Files`)
  try {
    await install(sourcePath, installPath)
  } catch (error) {
    exitWithError('Source Theme Files or Repository Access Error: ' + error.message)
  }
  logChildItem(`Done (${timer.now()} seconds)`)
}
