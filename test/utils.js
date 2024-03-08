// External Dependencies
import { mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { chdir, cwd, env } from 'node:process'
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
const GITHUB_ID = env.GITHUB_ID
const GITHUB_TOKEN = env.GITHUB_TOKEN

const baseInstallPath = resolve(tmpdir(), 'plugin-theme-component', 'test')

/**
 * Setup Components Repo
 * @return {Promise<string>} components repo path
 */
export async function setupComponentsRepo() {
  const componentsInstallPath = resolve(baseInstallPath, 'components')
  const componentsRepoUrl = env.COMPONENTS_REPO
    ? env.COMPONENTS_REPO
    : `https://${GITHUB_ID}:${GITHUB_TOKEN}@github.com/archetype-themes/components.git`

  await setupRepo(componentsRepoUrl, componentsInstallPath)
  return componentsInstallPath
}

/**
 * Setup Components Repo
 * @return {Promise<string>} components repo path
 */
export async function setupThemeRepo() {
  const themeInstallPath = resolve(baseInstallPath, 'theme')
  const themeRepoUrl = env.THEME_REPO
    ? env.THEME_REPO
    : `https://${GITHUB_ID}:${GITHUB_TOKEN}@github.com/archetype-themes/expanse.git`

  await setupRepo(themeRepoUrl, themeInstallPath)
  return themeInstallPath
}

/**
 *
 * @param {string} repositoryUrl
 * @param {string} installPath
 * @return {Promise<*>}
 */
async function setupRepo(repositoryUrl, installPath) {
  if (await exists(installPath)) {
    await rm(installPath, { recursive: true, force: true })
  }
  console.log(`SETUP REPO: ${repositoryUrl}`)
  await mkdir(installPath, { recursive: true })
  return clone(repositoryUrl, installPath)
}

export function chDirToDefault() {
  chdir(workingDirectory)
}
