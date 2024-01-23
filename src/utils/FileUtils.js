import { access, constants, copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { cwd } from 'node:process'
import { basename, join } from 'path'
import { BUILD_FOLDER_NAME, DEV_FOLDER_NAME } from '../config/CLI.js'
import logger from './Logger.js'

export default class FileUtils {
  /** @property {Set<string>} **/
  static #EXCLUDED_FOLDERS = new Set([BUILD_FOLDER_NAME, DEV_FOLDER_NAME, 'node_modules', '.yarn', '.idea', '.git', '.github'])
  /** @property {Object} **/
  static #FILE_ENCODING_OPTION = { encoding: 'utf8' }

  /**
   * Convert a Component or a Snippet's Absolute Path to a Relative one
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

    // Create Target Folder if it does not exist
    if (!await FileUtils.exists(targetFolder)) {
      logger.debug(`copyFolder: Target Folder "${targetFolder}" not found. Attempting to create it.`)
      await mkdir(targetFolder, { recursive: true })
    }

    for (const dirent of folderContent) {
      if (dirent.isFile()) {
        const sourceFile = join(sourceFolder, dirent.name)
        const targetFile = join(targetFolder, dirent.name)
        if (options.jsTemplateVariables) {
          fileOperations.push(FileUtils.processJsTemplateStringFile(sourceFile, targetFile, options.jsTemplateVariables))
        } else {
          fileOperations.push(copyFile(sourceFile, targetFile))
        }
      } else if (dirent.isDirectory() && options.recursive) {
        const newTargetFolder = join(targetFolder, dirent.name)
        await mkdir(newTargetFolder, { recursive: true })
        fileOperations.push(FileUtils.copyFolder(join(sourceFolder, dirent.name), newTargetFolder, options))
      }
    }
    return Promise.all(fileOperations)
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
   * Get File Contents
   * @param {string} file
   * @returns {Promise<string>}
   */
  static async getFileContents (file) {
    logger.trace(`Reading from disk: ${file}`)
    return readFile(file, FileUtils.#FILE_ENCODING_OPTION)
  }

  /**
   * Get directory file listing recursively
   * @param folder
   * @returns {Promise<string[]>}
   * @link https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
   */
  static async getFolderFilesRecursively (folder) {
    const entries = await readdir(folder, { withFileTypes: true })
    const files = []
    for (const entry of entries) {
      const absolutePath = join(folder, entry.name)
      if (entry.isDirectory()) {
        if (!FileUtils.#EXCLUDED_FOLDERS.has(entry.name)) {
          files.push(...(await FileUtils.getFolderFilesRecursively(absolutePath)))
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
      if (entry.isDirectory() && !FileUtils.#EXCLUDED_FOLDERS.has(entry.name)) {
        const absolutePath = join(folder, entry.name)
        folders.push(absolutePath)
        if (recursive) {
          folders.push(...(await FileUtils.getFolders(absolutePath, recursive)))
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
  static async getJsonFileContents (file) {
    return JSON.parse(await FileUtils.getFileContents(file))
  }

  /**
   * Merge Files contents and return it
   * @param {string[]} files
   * @returns {Promise<string>}
   */
  static async getMergedFilesContent (files) {
    let content = ''

    for (const file of files) {
      content += `${await FileUtils.getFileContents(file)}\n`
    }
    return content
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
          if (recursive && !FileUtils.#EXCLUDED_FOLDERS.has(entry.name)) {
            files = files.concat(await FileUtils.searchFile(join(path, entry.name), filename, recursive))
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
  static async saveFile (file, fileContents) {
    logger.trace(`Writing to disk: ${file}`)

    return writeFile(file, fileContents, FileUtils.#FILE_ENCODING_OPTION)
  }
}

export const convertToComponentRelativePath = FileUtils.convertToComponentRelativePath
export const copy = FileUtils.copy
export const copyFilesToFolder = FileUtils.copyFilesToFolder
export const copyFolder = FileUtils.copyFolder
export const exists = FileUtils.exists
export const getFileContents = FileUtils.getFileContents
export const getFolderFilesRecursively = FileUtils.getFolderFilesRecursively
export const getFolders = FileUtils.getFolders
export const getJsonFileContents = FileUtils.getJsonFileContents
export const getMergedFilesContent = FileUtils.getMergedFilesContent
export const isReadable = FileUtils.isReadable
export const isWritable = FileUtils.isWritable
export const processJsTemplateStringFile = FileUtils.processJsTemplateStringFile
export const saveFile = FileUtils.saveFile
export const searchFile = FileUtils.searchFile
