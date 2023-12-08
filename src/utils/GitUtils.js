import { execSync } from 'node:child_process'

export default class GitUtils {
  /**
   * Clones a git repository into the specified path.
   *
   * @param {string} repository - The URL of the git repository to clone.
   * @param {string} path - The path where the repository will be cloned.
   *
   * @return {void}
   */
  static clone (repository, path) {
    execSync(`git clone ${repository} ${path} --quiet`)
  }

  /**
   * Restores the working tree files in the given local repository path.
   *
   * @param {string} path - The path to the local repository.
   * @return {void}
   */
  static restore (path) {
    execSync('git restore . --quiet', { cwd: path })
  }

  /**
   * Pulls the latest changes from the remote repository.
   *
   * @param {string} path - The path to the local repository.
   * @return {void}
   */
  static pull (path) {
    execSync('git pull --quiet', { cwd: path })
  }
}

export const clone = GitUtils.clone
export const pull = GitUtils.pull
export const restore = GitUtils.restore
