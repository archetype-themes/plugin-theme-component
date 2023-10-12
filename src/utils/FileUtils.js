import { access, constants, copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { cwd } from 'node:process'
import { basename, join } from 'path'

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
   * Copy Files from an associative array
   * @param {Object.<string, string>} files
   * @return {Promise<Awaited<void>[]>}
   */
  static async copy (files) {
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
  static async copyFilesToFolder (files, targetFolder) {
    return Promise.all(files.map(file => copyFile(file, join(targetFolder, basename(file)))))
  }

  /**
   * Copy Folder Contents
   *
   * @typedef {Object.<string, string>} JsTemplateVariables
   *
   * @typedef {Object} CopyFolderOptions
   * @property {boolean} recursive
   * @property {JsTemplateVariables} jsTemplateVariables
   *
   * @param {string} sourceFolder
   * @param {string} targetFolder
   * @param {CopyFolderOptions} [options]
   * @return {Promise<Awaited<void>[]>}
   */
  static async copyFolder (sourceFolder, targetFolder, options = { recursive: false }) {
    const fileOperations = []
    logger.debug(`Copying folder contents from "${sourceFolder}" to "${targetFolder}"${options.recursive ? ' recursively' : ''}. `)
    const folderContent = await readdir(sourceFolder, { withFileTypes: true })

    for (const dirent of folderContent) {
      if (dirent.isFile()) {
        const sourceFile = join(sourceFolder, dirent.name)
        const targetFile = join(targetFolder, dirent.name)
        if (options.jsTemplateVariables) {
          fileOperations.push(this.processJsTemplateStringFile(sourceFile, targetFile, options.jsTemplateVariables))
        } else {
          fileOperations.push(copyFile(sourceFile, targetFile))
        }
      } else if (dirent.isDirectory() && options.recursive) {
        const newTargetFolder = join(targetFolder, dirent.name)
        await mkdir(newTargetFolder, { recursive: options.recursive })
        fileOperations.push(this.copyFolder(join(sourceFolder, dirent.name), newTargetFolder, options))
      }
    }
    return Promise.all(fileOperations)
  }

  /**
   *
   * @param {string} sourceFile
   * @param {string} targetFile
   * @param {JsTemplateVariables} jsTemplateVariables
   * @returns {Promise<void>}
   */
  static async processJsTemplateStringFile (sourceFile, targetFile, jsTemplateVariables) {
    logger.debug(`Processing JS Template String file ${sourceFile}`)
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
      const absolutePath = join(folder, entry.name)
      if (entry.isDirectory()) {
        if (!this.#EXCLUDED_FOLDERS.includes(entry.name)) {
          files.push(...(await this.getFolderFilesRecursively(absolutePath)))
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
  static async getFolders (folder, recursive = false) {
    const entries = await readdir(folder, { withFileTypes: true })
    const folders = []

    const promises = entries.map(async (entry) => {
      if (entry.isDirectory() && !this.#EXCLUDED_FOLDERS.includes(entry.name)) {
        const absolutePath = join(folder, entry.name)
        folders.push(absolutePath)
        if (recursive) {
          folders.push(...(await this.getFolders(absolutePath, recursive)))
        }
      }
    })

    await Promise.all(promises)
    return folders
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
   * Get JSON File Contents
   * @param {string} file
   * @returns {Promise<{}|[]>}
   */
  static async getJsonFileContents (file) {
    return JSON.parse(await this.getFileContents(file))
  }

  /**
   * Get File Contents
   * @param {string} file
   * @returns {Promise<string>}
   */
  static async getFileContents (file) {
    logger.trace(`Reading from disk: ${file}`)
    return readFile(file, this.#FILE_ENCODING_OPTION)
  }

  /**
   * Search for a file in a specified path.
   * @param {string} path
   * @param {string} filename
   * @param {boolean} [recursive]
   * @returns {Promise<string[]>}
   */
  static async searchFile (path, filename, recursive = false) {
    let files = []

    try {
      const entries = await readdir(path, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (recursive && !this.#EXCLUDED_FOLDERS.includes(entry.name)) {
            files = files.concat(await this.searchFile(join(path, entry.name), filename, recursive))
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
   * @returns {Promise<void>}
   */
  static async writeFile (file, fileContents) {
    logger.trace(`Writing to disk: ${file}`)

    return writeFile(file, fileContents, this.#FILE_ENCODING_OPTION)
  }
}

export default FileUtils
