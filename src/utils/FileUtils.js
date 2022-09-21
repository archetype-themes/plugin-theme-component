import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'path'
import { cwd } from 'node:process'
import logger from './Logger.js'

class FileUtils {
  /** @property {string[]} **/
  static #EXCLUDED_FOLDERS = ['node_modules', '.yarn', '.idea', '.git', 'build']
  /** @property {Object} **/
  static #FILE_ENCODING_OPTION = { encoding: 'utf8' }

  /**
   * Convert Component (Section/Snippet) Absolute Path to a Relative one
   * @param {string} absolutePath
   * @returns {string}
   */
  static convertToComponentRelativePath (absolutePath) {
    return absolutePath.replace(cwd(), '.')
  }

  /**
   * Writes Asset files references in liquid code as is and returns a list of asset files not references in liquid file
   * @param {string[]} sourceFiles Files to filter
   * @param {string} outputFolder Folder where to output the copied files
   * @param {string[]} inclusiveFilter Basename filter of files to copy
   * @returns {Promise<string[]>}
   */
  static async copyFiles (sourceFiles, outputFolder, inclusiveFilter = null) {
    const excludedFiles = []

    // Filter out JS Files already referenced in the liquid code
    for (const file of sourceFiles) {
      const fileBasename = basename(file)
      // When already referenced, copy as is in the assets folder
      if (inclusiveFilter) {
        if (inclusiveFilter.includes(fileBasename)) {
          await copyFile(file, join(outputFolder, fileBasename))
        } else {
          excludedFiles.push(file)
        }
      } else {
        await copyFile(file, join(outputFolder, fileBasename))
      }
    }
    return excludedFiles
  }

  /**
   *
   * @param {string} sourceFolder
   * @param {string} targetFolder
   * @param {boolean} [recursive=false]
   * @return {Promise<void>}
   */
  static async copyFolder (sourceFolder, targetFolder, recursive = false) {
    const folderContent = await readdir(sourceFolder, { withFileTypes: true })
    for (const dirent of folderContent) {
      if (dirent.isFile()) {
        await copyFile(join(sourceFolder, dirent.name), join(targetFolder, dirent.name))
      } else if (dirent.isDirectory() && recursive) {
        const newTargetFolder = join(targetFolder, dirent.name)
        await mkdir(newTargetFolder, { recursive: true })
        await this.copyFolder(join(sourceFolder, dirent.name), newTargetFolder, recursive)
      }
    }
  }

  /**
   * Gets directory file listing recursively
   * @param folder
   * @returns {Promise<FlatArray[] | string>}
   * @link https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
   */
  static async getFolderFilesRecursively (folder) {
    const entries = await readdir(folder, { withFileTypes: true })
    const files = []
    for (const entry of entries) {
      const absolutePath = join(folder, entry.name)
      if (entry.isDirectory() && !this.#EXCLUDED_FOLDERS.includes(entry.name)) {
        files.push(...(await this.getFolderFilesRecursively(absolutePath)))
      } else { files.push(absolutePath)}
    }

    return files
  }

  /**
   * Shortcut to a method to get root folder username of this builder package
   * @returns {string}
   */
  static getBuilderRootFolderName () {
    return dirname(dirname(import.meta.url)).substring(7)
  }

  /**
   * Merge Files contents and return it
   * @param {string[]} files
   * @returns {Promise<string>}
   */
  static async getMergedFilesContent (files) {
    let content = ''

    for (const file of files) {
      content += `${await this.getFileContents(file)}\n`
    }
    return content
  }

  /**
   * Get File Contents
   * @param {string} file
   * @returns {Promise<string>}
   */
  static async getFileContents (file) {
    logger.debug(`Reading from disk: ${file}`)
    return readFile(file, this.#FILE_ENCODING_OPTION)
  }

  /**
   *
   * @param {string} file
   * @param {string} fileContents
   * @returns {Promise<void>}
   */
  static async writeFile (file, fileContents) {
    logger.debug(`Writing to disk: ${file}`)
    return writeFile(file, fileContents, this.#FILE_ENCODING_OPTION)
  }
}

export default FileUtils
