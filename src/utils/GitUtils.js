// External Dependencies
import { execSync } from 'node:child_process'

// Internal Dependencies
import { copyFolder, getRandomTmpFolder } from './FileUtils.js'

/**
 * Clones a git repository into the specified path.
 *
 * @param {string} repository - The URL of the git repository to clone.
 * @param {string} path - The path where the repository will be cloned.
 *
 * @return {void}
 */
export function clone(repository, path) {
  execSync(`git clone ${repository} ${path} --quiet`)
}

export async function installRepository(url, installPath) {
  const downloadPath = await getRandomTmpFolder()
  clone(url, downloadPath)
  return copyFolder(downloadPath, installPath)
}
