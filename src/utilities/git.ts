import { execSync } from 'node:child_process'
import path from 'node:path'

export async function cloneTheme(repoUrl: string, targetDir: string): Promise<void> {
  execSync(`git clone ${repoUrl} ${targetDir}`, { stdio: 'inherit' })
}

/**
 * Gets the last commit hash for a given directory
 * @param directory The directory to get the commit hash for
 * @returns The last commit hash or null if not in a git repository
 */
export function getLastCommitHash(directory: string): null | string {
  try {
    const result = execSync('git rev-parse HEAD', {
      cwd: path.resolve(directory),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    })
    return result.trim()
  } catch {
    return null
  }
}
