// Internal Dependencies
import { copyFolder, getAbsolutePath } from './FileUtils.js'
import { downloadRepository, isGitHubUrl } from './GitUtils.js'
import { exitWithError } from './NodeUtils.js'
import { deleteTomlConfigFile } from './SessionUtils.js'

/**
 * Install an external component locally
 * @param {string} sourcePath - Local source path or remote GitHub URL
 * @param {string} installPath - Local destination path
 * @return Promise<Awaited<void>[]>
 */
export async function install(sourcePath, installPath) {
  if (isGitHubUrl(sourcePath)) {
    const downloadFolder = await downloadRepository(sourcePath)
    return copyFolder(downloadFolder, installPath, { recursive: true })
  } else {
    const fullPath = getAbsolutePath(sourcePath)
    return copyFolder(fullPath, installPath, { recursive: true })
  }
}

/**
 * Setup Repo in a temporary folder
 * @param {string} githubUrl - Remote GitHub URL
 * @return {Promise<string>} - Path to downloaded repository
 */
export async function setupRepo(githubUrl) {
  const downloadPath = await downloadRepository(githubUrl)
  await deleteTomlConfigFile(downloadPath)

  return downloadPath
}

/**
 * Install Theme Files
 * @param {string} sourcePath - Local source path or remote GitHub URL
 * @param {string} installPath - Local destination path
 * @return {Promise<void>} - Directory File Listing
 */
export async function installThemeFiles(sourcePath, installPath) {
  try {
    await install(sourcePath, installPath)
  } catch (error) {
    exitWithError('Source Theme Files or Repository Access Error: ' + error.message)
  }
}
