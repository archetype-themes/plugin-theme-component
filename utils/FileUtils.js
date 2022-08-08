import { copyFile, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'path'
import { cwd, exit } from 'node:process'
import logger from '../utils/Logger.js'

const FILE_ENCODING_OPTION = { encoding: 'UTF-8' }
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
          await this.copyFileOrDie(file, `${outputFolder}/${fileBasename}`)
        } else {
          excludedFiles.push(file)
        }
      } else {
        await this.copyFileOrDie(file, `${outputFolder}/${fileBasename}`)
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
  static async copyFileOrDie (sourceFile, destinationFile) {
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
  static async getFolderFilesRecursively (dir) {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      const files = await Promise.all(entries.map((entry) => {
        const absolutePath = resolve(dir, entry.name)
        return entry.isDirectory() && !EXCLUDED_FOLDERS.includes(entry.name) ? this.getFolderFilesRecursively(absolutePath) : absolutePath
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
  static getBuilderRootFolderName () {
    return dirname(dirname(import.meta.url)).substring(7)
  }

  /**
   *
   * @param {Array} files
   * @returns {Promise<string>}
   */
  static async mergeFileContents (files) {
    let content = ''

    for (const file of files) {
      content += `${await this.readFileOrDie(file)}\n`
    }
    return content
  }

  static async readFileOrDie (filename) {
    try {
      logger.debug(`Reading from disk: ${filename}`)
      return await readFile(filename, FILE_ENCODING_OPTION)
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
  static async writeFileOrDie (filename, fileContents) {
    try {
      logger.debug(`Writing to disk: ${filename}`)
      await writeFile(filename, fileContents)
    } catch (error) {
      logger.error(error.message)
      exit(1)
    }
  }

}

export default FileUtils
export { FILE_ENCODING_OPTION }