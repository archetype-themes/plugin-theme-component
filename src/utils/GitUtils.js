// External Dependencies
import { basename } from 'node:path'
import { env } from 'node:process'
import { ux } from '@oclif/core'

// Internal Dependencies
import { getRandomTmpFolder } from './FileUtils.js'
import { execAsync } from './NodeUtils.js'
import { addAuthToUrl, hasAuthInUrl } from './WebUtils.js'

const GITHUB_API_URL = 'https://api.github.com/'

/**
 * Clones a git repository into the specified path.
 *
 * @param {string} repository - The URL of the git repository to clone.
 * @param {string} path - The path where the repository will be cloned.
 *
 * @return {void}
 */
export async function clone(repository, path) {
  if (!(await isRepoPublic(repository)) && !hasAuthInUrl(repository)) {
    if (env.GITHUB_ID && env.GITHUB_TOKEN) {
      repository = addAuthToUrl(repository, env.GITHUB_ID, env.GITHUB_TOKEN)
      ux.debug(`Adding GitHub Auth Credentials From ENV Vars To Repository URL: ${repository}`)
    } else if (!(await isGitHubCliAuthActive())) {
      throw new Error(
        `Unable to clone private GitHub Repository "${repository}". Authentication credentials are unavailable through GitHub CLI or environment variables (GITHUB_ID/GITHUB_TOKEN).`
      )
    }
  }
  try {
    await execAsync(`git clone ${repository} ${path} --quiet`)
  } catch (e) {
    throw new Error(`Git Remote Repository Clone Error: ${e.message}`)
  }
}

/**
 * Download Repository
 * @param url
 * @return {Promise<*>}
 */
export async function downloadRepository(url) {
  const downloadPath = await getRandomTmpFolder()
  await clone(url, downloadPath)

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

/**
 * Test to see if the GitHub Repo URL is public or not
 * @param {string} repoUrl
 * @return {Promise<boolean>}
 */
async function isRepoPublic(repoUrl) {
  try {
    // console.log(repoUrl)
    const reposUrlInstance = new URL(repoUrl)
    // console.log(reposUrlInstance)
    let [, username, repository] = reposUrlInstance.pathname.split('/')

    if (repository.endsWith('.git')) {
      repository = repository.substring(0, repository.length - 4)
    }

    const apiUrl = `${GITHUB_API_URL}repos/${username}/${repository}`

    const response = await fetch(apiUrl, { method: 'GET' })
    // console.log(response)

    const repoInfo = JSON.parse(await response.text())
    // console.log(repoInfo)

    if ('private' in repoInfo) {
      return !repoInfo.private
    } else if (response.status === 404) {
      ux.debug(
        `GitUtils:isRepoPublic => The GitHub API call to get repository information for "${username}:${repository}" returned a "404 Not Found" HTTP Status. We will consider the repository as private.`
      )
      return false
    }

    // Vérifier si le dépôt est public ou privé
  } catch (error) {
    console.error('Erreur lors de la vérification du dépôt:', error)
    return false
  }
}

/**
 * Check if GitHub CLI is available and authenticated
 * @return {Promise<boolean>}
 */
export async function isGitHubCliAuthActive() {
  try {
    // Check if `gh` command is available
    await execAsync('gh --version')

    // Check authentication status
    const { stdout: authStatus } = await execAsync('gh auth status')
    return /Logged in to github.com account/.test(authStatus)
  } catch (error) {
    return false
  }
}
