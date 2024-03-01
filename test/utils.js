// External Dependencies
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import dotenv from 'dotenv'

// Internal Dependencies
import { exists } from '../src/utils/FileUtils.js'
import { clone } from '../src/utils/GitUtils.js'

// Load .env test file
dotenv.config({
  path: resolve(cwd(), '.env.test.local')
})

// Setup GitHub credentials
const GITHUB_ID = process.env.GITHUB_ID
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

/**
 * Setup Components Repo
 * @return {Promise<string>} components repo path
 */
export async function setupComponentsRepo () {
  const componentsRepoPath = resolve(tmpdir(), 'test', 'components')
  const componentsRepoUrl =
    process.env.GITHUB_COMPONENTS_REPO
      ? process.env.GITHUB_COMPONENTS_REPO
      : `https://${GITHUB_ID}:${GITHUB_TOKEN}@github.com/archetype-themes/components.git`

  if (await exists(componentsRepoPath)) {
    await rm(componentsRepoPath, { recursive: true, force: true })
  }
  await clone(componentsRepoUrl, componentsRepoPath)
  return componentsRepoPath
}
