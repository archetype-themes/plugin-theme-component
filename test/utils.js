// External Dependencies
import { mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { chdir, cwd } from 'node:process'
import dotenv from 'dotenv'

// Internal Dependencies
import { exists } from '../src/utils/FileUtils.js'
import { clone } from '../src/utils/GitUtils.js'

const workingDirectory = cwd()

// Load .env test file
dotenv.config({
  path: resolve(workingDirectory, '.env.test.local')
})

// Setup GitHub credentials
const GITHUB_ID = process.env.GITHUB_ID
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

const baseInstallPath = resolve(tmpdir(), 'plugin-theme-component', 'test')

/**
 * Setup Components Repo
 * @return {Promise<string>} components repo path
 */
export async function setupComponentsRepo () {
  const installPath = resolve(baseInstallPath, 'components')
  const componentsRepoUrl =
    process.env.GITHUB_COMPONENTS_REPO
      ? process.env.GITHUB_COMPONENTS_REPO
      : `https://${GITHUB_ID}:${GITHUB_TOKEN}@github.com/archetype-themes/components.git`

  if (await exists(installPath)) {
    await rm(installPath, { recursive: true, force: true })
  }
  await mkdir(installPath, { recursive: true })
  await clone(componentsRepoUrl, installPath)
  return installPath
}

/**
 * Setup Components Repo
 * @return {Promise<string>} components repo path
 */
export async function setupThemeRepo () {
  const themeRepoUrl =
    process.env.GITHUB_COMPONENTS_REPO
      ? process.env.GITHUB_COMPONENTS_REPO
      : `https://${GITHUB_ID}:${GITHUB_TOKEN}@github.com/archetype-themes/expanse.git`

  const installPath = resolve(baseInstallPath, 'theme')

  await setupRepo(themeRepoUrl, installPath)
  return installPath
}

/**
 *
 * @param {string} repository
 * @param {string} installPath
 * @return {Promise<*>}
 */
async function setupRepo (repository, installPath) {
  if (await exists(installPath)) {
    await rm(installPath, { recursive: true, force: true })
  }

  await mkdir(baseInstallPath, { recursive: true })
  return clone(repository, installPath)
}

export function chDirToDefault () {
  chdir(workingDirectory)
}
