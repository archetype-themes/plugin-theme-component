import { copyFile, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'path'
import { cwd } from 'node:process'
import logger from '../utils/Logger.js'

const FILE_ENCODING_OPTION = { encoding: 'utf8' }
const EXCLUDED_FOLDERS = ['node_modules', '.yarn', '.idea', '.git', 'build']

class FileUtils {

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
          await copyFile(file, `${outputFolder}/${fileBasename}`)
        } else {
          excludedFiles.push(file)
        }
      } else {
        await copyFile(file, `${outputFolder}/${fileBasename}`)
      }
    }
    return excludedFiles
  }

  /**
   * Gets directory file listing recursively
   * @param dir
   * @returns {Promise<FlatArray[] | string>}
   * @link https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
   */
  static async getFolderFilesRecursively (dir) {
    const entries = await readdir(dir, { withFileTypes: true })
    const files = await Promise.all(entries.map((entry) => {
      const absolutePath = resolve(dir, entry.name)
      return entry.isDirectory() && !EXCLUDED_FOLDERS.includes(entry.name) ? this.getFolderFilesRecursively(absolutePath) : absolutePath
    }))

    return files.flat()
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
    return readFile(file, FILE_ENCODING_OPTION)
  }

  /**
   *
   * @param {string} file
   * @param {string} fileContents
   * @returns {Promise<void>}
   */
  static async writeFile (file, fileContents) {
    logger.debug(`Writing to disk: ${file}`)
    return writeFile(file, fileContents, FILE_ENCODING_OPTION)
  }
}

export default FileUtils
export { FILE_ENCODING_OPTION }
