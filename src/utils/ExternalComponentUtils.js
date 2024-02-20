import { join } from 'path'
import FileAccessError from '../errors/FileAccessError.js'
import Session from '../models/static/Session.js'
import { copyFolder, exists, getFolderFilesRecursively, isReadable } from './FileUtils.js'
import { clone, pull, restore } from './GitUtils.js'
import { logChildItem } from './LoggerUtils.js'
import Timer from '../models/Timer.js'
import { isRepoUrl } from './WebUtils.js'

export async function install (sourceLocation, targetFolder, name) {
  logChildItem(`Searching for "${name}" locally`)
  const timer = new Timer()

  if (await exists(join(targetFolder, '.git'))) {
    logChildItem(`${name} repository found locally`)
    restore(targetFolder)
    if (Session.firstRun) {
      pull(targetFolder)
    }
  } else if (await exists(targetFolder)) {
    logChildItem(`${name} found locally`)
  } else if (isRepoUrl(sourceLocation)) {
    logChildItem(`Cloning missing local ${name} repository`)
    clone(sourceLocation, targetFolder)
  } else {
    logChildItem(`Installing missing local ${name} copy`)
    await copyFolder(sourceLocation, targetFolder, { recursive: true })
  }
  logChildItem(`${name} is now ready (${timer.now()} seconds)`)

  return getFolderFilesRecursively(targetFolder)
}

/**
 * Return a validated external path, using cwd for relative paths only.
 * @param {string} path
 * @param {string} cwd
 * @return {Promise<string>}
 * @throws FileAccessError
 */
export async function validateLocation (path, cwd) {
  if (isRepoUrl(path)) {
    return path
  }

  const fullPath = path.startsWith('/') ? path : join(cwd, path)
  if (await isReadable(fullPath)) {
    return fullPath
  }

  throw new FileAccessError(`Unable to read from ${fullPath}`)
}

export default {
  install,
  validateLocation
}
