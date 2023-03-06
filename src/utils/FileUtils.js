import { access, constants, copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { cwd } from 'node:process'
import path from 'path'

import logger from './Logger.js'

class FileUtils {
  /** @property {string[]} **/
  static #EXCLUDED_FOLDERS = ['node_modules', '.yarn', '.idea', '.git', 'build']
  /** @property {Object} **/
  static #FILE_ENCODING_OPTION = { encoding: 'utf8' }

  /**
   *
   * @param {string[]|string} files
   * @return {Promise<void[]>}
   */
  static async backup (files) {
    files = (typeof files === 'string' || files instanceof String) ? [files] : files

    return Promise.all(files.map((file) => {
      return copyFile(file, `${file.replace(/\.[^/.]+$/, '')}.${this.getReadableTimestamp()}${path.extname(file)}`)
    }))
  }

  /**
   * Convert Component (Section/Snippet) Absolute Path to a Relative one
   * @param {string} absolutePath
   * @returns {string}
   */
  static convertToComponentRelativePath (absolutePath) {
    return absolutePath.replace(cwd(), '.')
  }

  /**
   * Copy Files from an associative array
   * @param {string[]} files
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async copy (files) {
    const copyPromises = []
    for (const sourceFile in files) {
      logger.debug(`Copying ${path.basename(sourceFile)}`)
      copyPromises.push(copyFile(sourceFile, files[sourceFile]))
    }

    return Promise.all(copyPromises)
  }

  /**
   * Copy All Files to a Specified Folder
   * @param files
   * @param targetFolder
   * @return {Promise<Awaited<void>[]>}
   */
  static async copyFilesToFolder (files, targetFolder) {
    const copyPromises = []
    for (const file of files) {
      copyPromises.push(copyFile(file, path.join(targetFolder, path.basename(file))))
    }
    return Promise.all(copyPromises)
  }

  /**
   * Copy Folder Contents
   * @param {string} sourceFolder
   * @param {string} targetFolder
   * @param {boolean} [recursive=false]
   * @return {Promise<void>}
   */
  static async copyFolder (sourceFolder, targetFolder, recursive = false) {
    const promises = []
    const folderContent = await readdir(sourceFolder, { withFileTypes: true })

    for (const dirent of folderContent) {
      if (dirent.isFile()) {
        promises.push(copyFile(path.join(sourceFolder, dirent.name), path.join(targetFolder, dirent.name)))
      } else if (dirent.isDirectory() && recursive) {
        const newTargetFolder = path.join(targetFolder, dirent.name)
        await mkdir(newTargetFolder, { recursive: true })
        promises.push(this.copyFolder(path.join(sourceFolder, dirent.name), newTargetFolder, recursive))
      }
    }
    return Promise.all(promises)
  }

  /**
   * Check If File Exists
   * @param {string} file
   * @return {Promise<boolean>}
   */
  static async exists (file) {
    try {
      await access(file, constants.F_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check If File Is Readable
   * @param file
   * @return {Promise<boolean>}
   */
  static async isReadable (file) {
    try {
      await access(file, constants.R_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check If File Is Writable
   * @param file
   * @return {Promise<boolean>}
   */
  static async isWritable (file) {
    try {
      await access(file, constants.W_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get directory file listing recursively
   * @param folder
   * @returns {Promise<FlatArray[] | string>}
   * @link https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
   */
  static async getFolderFilesRecursively (folder) {
    const entries = await readdir(folder, { withFileTypes: true })
    const files = []
    for (const entry of entries) {
      const absolutePath = path.join(folder, entry.name)
      if (entry.isDirectory()) {
        if (!this.#EXCLUDED_FOLDERS.includes(entry.name)) {
          files.push(...(await this.getFolderFilesRecursively(absolutePath)))
        }
      } else { files.push(absolutePath) }
    }

    return files
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
   * Get Readable Timestamp
   * @param {Date} [date]
   * @return {string}
   */
  static getReadableTimestamp (date) {
    if (!date) {
      date = new Date()
    }
    const dateString = date.toISOString()

    return dateString.substring(0, 19).replace('T', '_').replaceAll(':', '-')
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
