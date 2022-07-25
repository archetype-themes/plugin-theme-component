import { copyFile, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'path'
import { exit } from 'node:process'
import logger from '../utils/Logger.js'

const FILE_ENCODING_OPTION = { encoding: 'UTF-8' }

/**
 * Writes Asset files references in liquid code as is and returns a list of asset files not references in liquid file
 * @param {Array} fileCandidates Files to filter
 * @param {string} outputFolder Folder where to output the copied files
 * @param {Array} filesToCopy Basename filter of files to copy
 * @returns {Promise<string[]>}
 */
async function copyFilesWithFilter (fileCandidates, outputFolder, filesToCopy = null) {
  const excludedFiles = []

  // Filter out JS Files already referenced in the liquid code
  for (const file of fileCandidates) {
    const fileBasename = basename(file)
    // When already referenced, copy as is in the assets folder
    if (filesToCopy && filesToCopy.includes(fileBasename)) {
      await copyFileOrDie(file, `${outputFolder}/${fileBasename}`)
    } else {
      excludedFiles.push(file)
    }
  }
  return excludedFiles
}

/**
 *
 * @param {string} sourceFile
 * @param {string} destinationFile
 * @returns {Promise<void>}
 */
async function copyFileOrDie (sourceFile, destinationFile) {
  try {
    await copyFile(sourceFile, destinationFile)
  } catch (error) {
    logger.error(error.message)
    exit(1)
  }
}

/**
 * Gets directory file listing recursively
 * @param dir
 * @returns {Promise<FlatArray[] | string>}
 * @link https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
 */
async function getFolderFilesRecursively (dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    const files = await Promise.all(entries.map((entry) => {
      const absolutePath = resolve(dir, entry.name)
      return entry.isDirectory() && entry.name !== 'node_modules' ? getFolderFilesRecursively(absolutePath) : absolutePath
    }))
    return files.flat()
  } catch (error) {
    logger.error(error.message)
    exit(1)
  }
}

/**
 * Shortcut to a method to get root folder username of this builder package
 * @returns {string}
 */
function getRootFolderName () {
  return dirname(dirname(import.meta.url)).substring(7)
}

/**
 *
 * @param {Array} files
 * @returns {Promise<string>}
 */
async function mergeFileContents (files) {
  let content = ''

  for (const file of files) {
    content += `${await readFileOrDie(file)}\n`
  }
  return content
}

async function readFileOrDie (file) {
  try {
    return await readFile(file, FILE_ENCODING_OPTION)
  } catch (error) {
    logger.error(error.message)
    exit(1)
  }
}

/**
 *
 * @param {string} filename
 * @param {string} fileContents
 * @returns {Promise<void>}
 */
async function writeFileOrDie (filename, fileContents) {
  try {
    await writeFile(filename, fileContents)
  } catch (error) {
    logger.error(error.message)
    exit(1)
  }
}

export {
  FILE_ENCODING_OPTION,
  copyFileOrDie,
  copyFilesWithFilter,
  getFolderFilesRecursively,
  getRootFolderName,
  mergeFileContents,
  readFileOrDie,
  writeFileOrDie
}