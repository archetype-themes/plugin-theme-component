// REF: https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
import { copyFile, readdir } from 'node:fs/promises'
import { basename, resolve } from 'path'

/**
 *
 * @param {string} dir
 * @returns {string[]}
 */
async function getFolderFilesRecursively (dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map((entry) => {
    const res = resolve(dir, entry.name)
    return entry.isDirectory() && entry.name !== 'node_modules' ? getFolderFilesRecursively(res) : res
  }))
  return files.flat()
}

/**
 * Writes Asset files references in liquid code as is and returns a list of asset files not references in liquid file
 * @param fileCandidates Files to copy or exclude
 * @param outputFolder Folder where to output the files
 * @param filesToCopy Basename of files to copy
 * @returns {Promise<string[]>}
 */
async function copyFilesInList (fileCandidates, outputFolder, filesToCopy = null) {
  const excludedFiles = []

  // Filter out JS Files already referenced in the liquid code
  for (const file of fileCandidates) {
    const fileBasename = basename(file)
    // When already referenced, copy as is in the assets folder
    if (filesToCopy && filesToCopy.includes(fileBasename)) {
      await copyFile(file, outputFolder + '/' + fileBasename)
    } else {
      excludedFiles.push(file)
    }
  }
  return excludedFiles
}

export {
  getFolderFilesRecursively, copyFilesInList
}