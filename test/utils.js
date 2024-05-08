// External Dependencies
import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chdir, cwd, env } from 'node:process'
import dotenv from 'dotenv'

// Internal Dependencies
import { downloadRepository } from '../src/utils/GitUtils.js'
import { CONFIG_FILE_NAME } from '../src/config/CLI.js'

const workingDirectory = cwd()

// Load .env test file
dotenv.config({
  path: resolve(workingDirectory, '.env.test.local')
})

// Setup GitHub credentials
const GITHUB_ID = env.GITHUB_ID
const GITHUB_TOKEN = env.GITHUB_TOKEN

/**
 * Setup Components Repo
 * @return {Promise<string>} components repo path
 */
export async function setupComponentsRepo() {
  const componentsRepoUrl = env.COMPONENTS_REPO
    ? env.COMPONENTS_REPO
    : `https://${GITHUB_ID}:${GITHUB_TOKEN}@github.com/archetype-themes/components.git`

  const componentsInstallPath = await downloadRepository(componentsRepoUrl)
  await rm(resolve(componentsInstallPath, CONFIG_FILE_NAME))
  return componentsInstallPath
}

/**
 * Setup Components Repo
 * @return {Promise<string>} components repo path
 */
export async function setupThemeRepo() {
  if (!GITHUB_ID || !GITHUB_TOKEN) {
    throw new Error()
  }
  const themeRepoUrl = env.THEME_REPO
    ? env.THEME_REPO
    : `https://${GITHUB_ID}:${GITHUB_TOKEN}@github.com/archetype-themes/expanse.git`

  const themeInstallPath = await downloadRepository(themeRepoUrl)
  await rm(resolve(themeInstallPath, CONFIG_FILE_NAME))
  return themeInstallPath
}

export function chDirToDefault() {
  chdir(workingDirectory)
}
