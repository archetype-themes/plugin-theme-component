// External Dependencies
import { exec } from 'node:child_process'
import { cwd, env } from 'node:process'
import { join } from 'node:path'
import { promisify } from 'node:util'

// Internal Dependencies
import { getJsonFileContents } from './FileUtils.js'
import InternalError from '../errors/InternalError.js'

/**
 * exec with promisify
 * @type function
 * @param {string} command - Shell command
 * @param {object} [options] - Command options
 * @return {Promise<{ stdout: string, stderr: string }>}
 */
export const execAsync = promisify(exec)

/**
 * Shortcut to a method to get root folder username
 * @returns {string}
 */
export function getCLIRootFolderName() {
  return new URL('../../', import.meta.url).pathname
}

/**
 * Get Node.js package name without the scope
 * @param {Object} [packageManifest] Optional Package Manifest JSON object
 * @return {string}
 */
export function getPackageName(packageManifest) {
  let packageNameAndScope
  if (packageManifest?.name) {
    packageNameAndScope = packageManifest.name
  } else if (!packageManifest && env.npm_package_name) {
    packageNameAndScope = env.npm_package_name
  } else {
    throw new InternalError('Unable To Determine NPM Package Name')
  }

  return packageNameAndScope.includes('/') ? packageNameAndScope.split('/')[1] : packageNameAndScope
}

/**
 * Get Package JSON Content as an Object
 * @param {string} [path]
 * @return {Promise<Object>}
 */
export async function getPackageManifest(path) {
  if (!path && !env.npm_package_json) {
    path = cwd()
  }

  let packageJsonFile

  if (path) {
    packageJsonFile = join(path, 'package.json')
  } else {
    packageJsonFile = env.npm_package_json
  }

  return await getJsonFileContents(packageJsonFile)
}

/**
 * Get Node.js Package Scope (i.e.: @archetype-themes)
 * @param {Object} [packageManifest] Optional Package Manifest JSON object
 * @return {string}
 */
export function getPackageScope(packageManifest) {
  let packageNameAndScope
  if (packageManifest?.name) {
    packageNameAndScope = packageManifest.name
  } else if (env.npm_package_name) {
    packageNameAndScope = env.npm_package_name
  } else {
    throw new InternalError('Unavailable NPM Package Name environment variable')
  }
  return packageNameAndScope.includes('/') ? packageNameAndScope.split('/')[0] : ''
}
