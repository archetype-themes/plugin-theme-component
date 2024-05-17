// Internal Dependencies
import { copyFolder, exists, getAbsolutePath, getRandomTmpFolder } from './FileUtils.js'
import { clone, isGitHubUrl } from './GitUtils.js'
import { execAsync } from './NodeUtils.js'
import { deleteTomlConfigFile } from './SessionUtils.js'
import { resolve } from 'node:path'

/**
 * Install an external component locally
 * @param {string} sourcePath - Local source path or remote GitHub URL
 * @param {string} [installPath] - Local destination path
 * @return {Promise<string>} - Path to the installed component
 */
export async function install(sourcePath, installPath) {
  if (!installPath) {
    installPath = await getRandomTmpFolder()
  }
  if (isGitHubUrl(sourcePath)) {
    await clone(sourcePath, installPath)
  } else {
    const absoluteSourcePath = getAbsolutePath(sourcePath)
    await copyFolder(absoluteSourcePath, installPath, { recursive: true })
  }

  // Remove any existing toml config file
  await deleteTomlConfigFile(installPath)
  // Install npm dependencies
  if (await exists(resolve(installPath, 'package.json'))) {
    await execAsync('npm ci', { cwd: installPath })
  }
  return installPath
}
