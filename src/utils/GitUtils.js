import { execSync } from 'node:child_process'

/**
 * Cleans the working directory by removing untracked files and directories.
 *
 * @param {string} path - The path of the working directory to clean.
 */
export function clean (path) {
  execSync('git clean -f -d --quiet', { cwd: path })
}

/**
 * Clones a git repository into the specified path.
 *
 * @param {string} repository - The URL of the git repository to clone.
 * @param {string} path - The path where the repository will be cloned.
 *
 * @return {void}
 */
export function clone (repository, path) {
  execSync(`git clone ${repository} ${path} --quiet`)
}

/**
 * Restores the working tree files in the given local repository path.
 *
 * @param {string} path - The path to the local repository.
 * @return {void}
 */
export function restore (path) {
  execSync('git restore . --quiet', { cwd: path })
}

/**
 * Pulls the latest changes from the remote repository.
 *
 * @param {string} path - The path to the local repository.
 * @return {void}
 */
export function pull (path) {
  execSync('git pull --quiet', { cwd: path })
}

export default { clean, clone, pull, restore }
