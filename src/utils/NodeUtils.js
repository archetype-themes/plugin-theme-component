// External Dependencies
import { cwd, env, exit } from 'node:process'
import { dirname, join, sep } from 'node:path'
import { ux } from '@oclif/core'

// Internal Dependencies
import FileUtils from './FileUtils.js'
import { isDebugEnabled } from './LoggerUtils.js'
import InternalError from '../errors/InternalError.js'

/**
 * Exit with Error
 * @param {Error|string} error
 */
export function exitWithError(error) {
  if (
    typeof error === 'string' ||
    error instanceof String ||
    isDebugEnabled()
  ) {
    ux.error(error)
  } else {
    let errorMessage = ''
    if (error.name && error.name.toLowerCase() !== 'error') {
      errorMessage = `${error.name}: `
    }
    if (error.message) {
      errorMessage += error.message
    }
    ux.error(errorMessage)
  }
  exit(1)
}

export function getCurrentWorkingDirectoryName() {
  const currentWorkingDirectory = cwd()
  const directoryArray = currentWorkingDirectory.split(sep)

  return directoryArray[directoryArray.length - 1]
}

/**
 * Shortcut to a method to get root folder username
 * @returns {string}
 */
export function getCLIRootFolderName() {
  return new URL('../../', import.meta.url).pathname
}

/**
 * Get Package Root Folder
 * @return {string}
 */
export function getPackageRootFolder() {
  // Generic env variable (should be set by npm and yarn)
  if (env.npm_package_json) {
    return dirname(env.npm_package_json)
  }

  throw new InternalError(
    'Unable to get Package Root Folder through Environment Variables. Please make sure you are running this CLI from within a Node Package folder.'
  )
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
  } else if (env.npm_package_name) {
    packageNameAndScope = env.npm_package_name
  } else {
    throw new InternalError(
      'Unavailable NPM Package Name environment variable and/or Package Manifest'
    )
  }

  return packageNameAndScope.includes('/')
    ? packageNameAndScope.split('/')[1]
    : packageNameAndScope
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

  return await FileUtils.getJsonFileContents(packageJsonFile)
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
  return packageNameAndScope.includes('/')
    ? packageNameAndScope.split('/')[0]
    : ''
}

export default {
  exitWithError,
  getCurrentWorkingDirectoryName,
  getCLIRootFolderName,
  getPackageRootFolder,
  getPackageName,
  getPackageScope
}
