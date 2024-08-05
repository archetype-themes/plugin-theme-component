// External Dependencies
import { access, constants, copyFile, cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { cwd } from 'node:process'

// Internal Dependencies
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'
import { debug, trace } from './logger.js'
import {
  DEV_FOLDER_NAME,
  FileTypes,
  LIQUID_EXTENSION,
  SCRIPT_EXTENSIONS,
  SCRIPT_TEST_EXTENSIONS,
  STYLE_EXTENSIONS,
  SVG_EXTENSION
} from '../config/constants.js'

/** @type {string[]} **/
const EXCLUDED_FOLDERS = [DEV_FOLDER_NAME, 'node_modules', '.yarn', '.idea', '.git']

/** @type {Object} **/
const FILE_ENCODING_OPTION = { encoding: 'utf8' }

/**
 * Convert a Component or a Snippet's Absolute Path to a Relative one
 * @param {string} absolutePath
 * @returns {string}
 */
export function convertToComponentRelativePath(absolutePath) {
  return absolutePath.replace(cwd(), '.')
}

/**
 * Copy File and Create Path when necessary
 * @param {string} file
 * @param {string} targetFolder
 * @returns {Promise<void>}
 */
export async function copyFileAndCreatePath(file, targetFolder) {
  if (!(await exists(dirname(targetFolder)))) {
    await mkdir(dirname(targetFolder), { recursive: true })
  }

  return copyFile(file, targetFolder)
}

/**
 * Copy Folder Contents
 *
 * @typedef {Object.<string, string>} JsTemplateVariables
 *
 * @typedef {Object} CopyFolderOptions
 * @property {boolean} recursive
 * @property {string[]} rename - Rename source file from/to as a key/value pair
 * @property {JsTemplateVariables} jsTemplateVariables
 *
 * @param {string} sourceFolder
 * @param {string} targetFolder
 * @param {CopyFolderOptions} [options]
 * @return {Promise<Awaited<void>[]>}
 */
export async function copyFolder(sourceFolder, targetFolder, options = { recursive: false }) {
  const fileOperations = []
  debug(
    `Copying folder contents from "${sourceFolder}" to "${targetFolder}"${options.recursive ? ' recursively' : ''}. `
  )
  const folderContent = await readdir(sourceFolder, { withFileTypes: true })

  // Create Target Folder if it does not exist
  if (!(await exists(targetFolder))) {
    debug(`copyFolder: Target Folder "${targetFolder}" not found. Attempting to create it.`)
    await mkdir(targetFolder, { recursive: true })
  }

  for (const dirent of folderContent) {
    if (dirent.isFile()) {
      const sourceFile = join(sourceFolder, dirent.name)
      const targetFileName = options.rename ? dirent.name.replace(options.rename[0], options.rename[1]) : dirent.name
      const targetFile = join(targetFolder, targetFileName)
      if (options.jsTemplateVariables) {
        fileOperations.push(processJsTemplateStringFile(sourceFile, targetFile, options.jsTemplateVariables))
      } else {
        fileOperations.push(cp(sourceFile, targetFile, { preserveTimestamps: true }))
      }
    } else if (dirent.isDirectory() && options.recursive && !EXCLUDED_FOLDERS.includes(dirent.name)) {
      const newTargetFolder = join(targetFolder, dirent.name)
      fileOperations.push(copyFolder(join(sourceFolder, dirent.name), newTargetFolder, options))
    }
  }
  return Promise.all(fileOperations)
}

/**
 * Check if a file or folder exists
 * @param {string} file
 * @return {Promise<boolean>}
 */
export async function exists(file) {
  try {
    await access(file, constants.F_OK)
    return true
  } catch {
    return false
  }
}

/**
 * Get File Contents
 * @param {string} file
 * @returns {Promise<string>}
 */
export async function getFileContents(file) {
  trace(`Reading from disk: ${file}`)
  // noinspection JSValidateTypes
  return readFile(file, FILE_ENCODING_OPTION)
}

/**
 * Get directory file listing recursively
 * @param {string} folder
 * @param {boolean} [recursive=false]
 * @returns {Promise<string[]>}
 * @link https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
 */
export async function getFiles(folder, recursive = false) {
  const entries = await readdir(folder, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const absolutePath = join(folder, entry.name)
    if (entry.isDirectory()) {
      if (recursive && !EXCLUDED_FOLDERS.includes(entry.name)) {
        files.push(...(await getFiles(absolutePath, recursive)))
      }
    } else {
      files.push(absolutePath)
    }
  }

  return files
}

/**
 * Get Folders List
 * @param {string} folder
 * @param {boolean} recursive
 * @returns {Promise<string[]>}
 */
export async function getFolders(folder, recursive = false) {
  const entries = await readdir(folder, { withFileTypes: true })
  const folders = []

  const promises = entries.map(async (entry) => {
    if (entry.isDirectory() && !EXCLUDED_FOLDERS.includes(entry.name)) {
      const absolutePath = join(folder, entry.name)
      folders.push(absolutePath)
      if (recursive) {
        folders.push(...(await getFolders(absolutePath, recursive)))
      }
    }
  })

  await Promise.all(promises)
  return folders
}

/**
 * @template T
 * Get JSON File Contents
 * @param {string} file
 * @returns {Promise<T>}
 */
export async function getJsonFileContents(file) {
  debug(`Parsing JSON file "${file}"`)
  return JSON.parse(await getFileContents(file))
}

/**
 * Get a random temporary folder
 * @return {Promise<string>}
 */
export async function getRandomTmpFolder() {
  const tmpRandomFolder = resolve(tmpdir(), 'plugin-theme-component', randomBytes(16).toString('hex'))
  if (await exists(tmpRandomFolder)) {
    await rm(tmpRandomFolder, { recursive: true })
  }
  await mkdir(tmpRandomFolder, { recursive: true })

  return tmpRandomFolder
}

/**
 * Check if a file is readable
 * @param {string} file
 * @return {Promise<boolean>}
 */
export async function isReadable(file) {
  try {
    await access(file, constants.R_OK)
    return true
  } catch {
    return false
  }
}

/**
 * Check if a file is writable
 * @param {string} file
 * @return {Promise<boolean>}
 */
export async function isWritable(file) {
  try {
    await access(file, constants.W_OK)
    return true
  } catch {
    return false
  }
}

/**
 * Manually interpret JS template strings within a file
 * @param {string} sourceFile
 * @param {string} targetFile
 * @param {JsTemplateVariables} jsTemplateVariables
 * @returns {Promise<void>}
 */
export async function processJsTemplateStringFile(sourceFile, targetFile, jsTemplateVariables) {
  debug(`Processing JS Template String file ${sourceFile}`)
  // Read the file's content
  const data = await readFile(sourceFile, 'utf8')

  // Initiate JS template variables for interpolation
  Object.entries(jsTemplateVariables).forEach(([key, value]) => {
    global[key] = value
  })

  // Interpret the file content as a JS template string
  // eslint-disable-next-line no-eval
  const template = eval('`' + data + '`')

  // Write the interpreted content back to disk
  return writeFile(targetFile, template)
}

/**
 * Save File
 * @param {string} file
 * @param {string} fileContents
 * @return {Promise<void>}
 */
export async function saveFile(file, fileContents) {
  trace(`Writing to disk: ${file}`)

  if (await isReadable(file)) {
    const destinationContents = await getFileContents(file)
    if (destinationContents !== fileContents) {
      const exist = await exists(dirname(file))
      if (!exist) {
        await mkdir(dirname(file), { recursive: true })
      }
      return writeFile(file, fileContents, FILE_ENCODING_OPTION)
    }
  } else {
    const exist = await exists(dirname(file))
    if (!exist) {
      await mkdir(dirname(file), { recursive: true })
    }
    return writeFile(file, fileContents, FILE_ENCODING_OPTION)
  }
}

/**
 * Get Absolute Path
 * This will prepend a relative path with the CWD
 * @param {string} path - Relative or Absolute Path
 * @return {string} Absolute Path
 */
export function getAbsolutePath(path) {
  return path.startsWith(sep) ? path : join(cwd(), path)
}

export function getFileType(filename) {
  const extension = extname(filename).toLowerCase()
  if (SCRIPT_TEST_EXTENSIONS.includes(extension)) {
    return FileTypes.Test
  }
  if (SCRIPT_EXTENSIONS.includes(extension)) {
    return FileTypes.Javascript
  }
  if (STYLE_EXTENSIONS.includes(extension)) {
    return FileTypes.Css
  }
  if (extension === LIQUID_EXTENSION) {
    return FileTypes.Liquid
  }
  if (extension === SVG_EXTENSION) {
    return FileTypes.Svg
  }
  return null
}
