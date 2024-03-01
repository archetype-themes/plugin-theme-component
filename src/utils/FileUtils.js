// External Dependencies
import { access, constants, copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join, sep } from 'node:path'
import { cwd } from 'node:process'
import { ux } from '@oclif/core'

// Internal Dependencies
import { BUILD_FOLDER_NAME, DEV_FOLDER_NAME } from '../config/CLI.js'

/** @type {string[]} **/
const EXCLUDED_FOLDERS = [BUILD_FOLDER_NAME, DEV_FOLDER_NAME, 'node_modules', '.yarn', '.idea', '.git']

/** @type {Object} **/
const FILE_ENCODING_OPTION = { encoding: 'utf8' }

/**
 * Convert a Component or a Snippet's Absolute Path to a Relative one
 * @param {string} absolutePath
 * @returns {string}
 */
export function convertToComponentRelativePath (absolutePath) {
  return absolutePath.replace(cwd(), '.')
}

/**
 * Copy Files from an associative array
 * @param {Object.<string, string>} files
 * @return {Promise<Awaited<void>[]>}
 */
export async function copy (files) {
  const copyPromises = Object.entries(files).map(
    ([sourceFile, destination]) => copyFile(sourceFile, destination))

  return Promise.all(copyPromises)
}

/**
 * Copy All Files to a Specified Folder
 * @param {string[]} files
 * @param {string} targetFolder
 * @return {Promise<Awaited<void>[]>}
 */
export async function copyFilesToFolder (files, targetFolder) {
  const filesCopyPromises = files.map(file => copyFile(file, join(targetFolder, basename(file))))

  return Promise.all(filesCopyPromises)
}

/**
 * Copy Folder Contents
 *
 * @typedef {Object.<string, string>} JsTemplateVariables
 *
 * @typedef {Object} CopyFolderOptions
 * @property {boolean} recursive
 * @property {string[]} rename - Rename source file from/to value pair
 * @property {JsTemplateVariables} jsTemplateVariables
 *
 * @param {string} sourceFolder
 * @param {string} targetFolder
 * @param {CopyFolderOptions} [options]
 * @return {Promise<Awaited<void>[]>}
 */
export async function copyFolder (sourceFolder, targetFolder, options = { recursive: false }) {
  const fileOperations = []
  ux.debug(`Copying folder contents from "${sourceFolder}" to "${targetFolder}"${options.recursive ? ' recursively' : ''}. `)
  const folderContent = await readdir(sourceFolder, { withFileTypes: true })

  // Create Target Folder if it does not exist
  if (!await exists(targetFolder)) {
    ux.debug(`copyFolder: Target Folder "${targetFolder}" not found. Attempting to create it.`)
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
        fileOperations.push(copyFile(sourceFile, targetFile))
      }
    } else if (dirent.isDirectory() && options.recursive) {
      const newTargetFolder = join(targetFolder, dirent.name)
      await mkdir(newTargetFolder, { recursive: true })
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
export async function exists (file) {
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
export async function getFileContents (file) {
  ux.trace(`Reading from disk: ${file}`)
  return readFile(file, FILE_ENCODING_OPTION)
}

/**
 * Get directory file listing recursively
 * @param folder
 * @returns {Promise<string[]>}
 * @link https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
 */
export async function getFolderFilesRecursively (folder) {
  const entries = await readdir(folder, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const absolutePath = join(folder, entry.name)
    if (entry.isDirectory()) {
      if (!EXCLUDED_FOLDERS.includes(entry.name)) {
        files.push(...(await getFolderFilesRecursively(absolutePath)))
      }
    } else { files.push(absolutePath) }
  }

  return files
}

/**
 * Get Folders List
 * @param {string} folder
 * @param {boolean} recursive
 * @returns {Promise<string[]>}
 */
export async function getFolders (folder, recursive = false) {
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
export async function getJsonFileContents (file) {
  ux.debug(`Parsing JSON file "${file}"`)
  return JSON.parse(await getFileContents(file))
}

/**
 * Merge Files contents and return it
 * @param {string[]} files
 * @returns {Promise<string>}
 */
export async function getMergedFilesContent (files) {
  let content = ''

  for (const file of files) {
    content += `${await getFileContents(file)}\n`
  }
  return content
}

/**
 * Check if a file is readable
 * @param file
 * @return {Promise<boolean>}
 */
export async function isReadable (file) {
  try {
    await access(file, constants.R_OK)
    return true
  } catch {
    return false
  }
}

/**
 * Check if a file is writable
 * @param file
 * @return {Promise<boolean>}
 */
export async function isWritable (file) {
  try {
    await access(file, constants.W_OK)
    return true
  } catch {
    return false
  }
}

/**
 *
 * @param {string} sourceFile
 * @param {string} targetFile
 * @param {JsTemplateVariables} jsTemplateVariables
 * @returns {Promise<void>}
 */
export async function processJsTemplateStringFile (sourceFile, targetFile, jsTemplateVariables) {
  ux.debug(`Processing JS Template String file ${sourceFile}`)
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
 * Search for a file in a specified path.
 * @param {string} path
 * @param {string} filename
 * @param {boolean} [recursive]
 * @returns {Promise<string[]>}
 */
export async function searchFile (path, filename, recursive = false) {
  let files = []

  try {
    const entries = await readdir(path, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (recursive && !EXCLUDED_FOLDERS.includes(entry.name)) {
          files = files.concat(await searchFile(join(path, entry.name), filename, recursive))
        }
      } else if (entry.name === filename) {
        files.push(join(path, entry.name))
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${path}:`, err)
  }

  return files
}

/**
 *
 * @param {string} file
 * @param {string} fileContents
 * @return {Promise<void>}
 */
export async function saveFile (file, fileContents) {
  ux.trace(`Writing to disk: ${file}`)

  return writeFile(file, fileContents, FILE_ENCODING_OPTION)
}

/**
 * Get Absolute Path
 * @param {string} path - Relative or Absolute Path
 * @return {Promise<string>}
 */
export async function getAbsolutePath (path) {
  return path.startsWith(sep) ? path : join(cwd(), path)
}

export default {
  convertToComponentRelativePath,
  copy,
  copyFilesToFolder,
  copyFolder,
  exists,
  getAbsolutePath,
  getFileContents,
  getFolderFilesRecursively,
  getFolders,
  getJsonFileContents,
  getMergedFilesContent,
  isReadable,
  isWritable,
  processJsTemplateStringFile,
  saveFile,
  searchFile
}
