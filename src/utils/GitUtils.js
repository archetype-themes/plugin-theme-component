// External Dependencies
import { execSync } from 'node:child_process'
import { basename } from 'node:path'

// Internal Dependencies
import { getRandomTmpFolder } from './FileUtils.js'

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

export async function downloadRepository(url) {
  const downloadPath = await getRandomTmpFolder()
  clone(url, downloadPath)
  return downloadPath
}

/**
 * Extract Repository Name From A GitHub URL
 * @param {string} repoUrl
 * @return {string}
 */
export function getRepoNameFromGitHubUrl(repoUrl) {
  return basename(repoUrl, '.git')
}

/**
 * Test a string to see if it contains a GitHub URL
 * @param {string} possibleRepoUrl
 * @return {boolean}
 */
export function isGitHubUrl(possibleRepoUrl) {
  return /github\.com/.test(possibleRepoUrl)
}
