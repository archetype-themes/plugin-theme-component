// External Dependencies
import { basename, dirname, extname, join } from 'node:path'
import { ux } from '@oclif/core'

// Internal Dependencies
import FileUtils from './FileUtils.js'
import JavascriptUtils from './JavascriptUtils.js'
import StylesUtils from './StylesUtils.js'
import { ASSETS_FOLDER_NAME, SETUP_FOLDER_NAME } from '../config/Components.js'
import FileAccessError from '../errors/FileAccessError.js'
import FileMissingError from '../errors/FileMissingError.js'
import InputFileError from '../errors/InputFileError.js'

/** @type {string[]}  **/
export const STYLE_EXTENSIONS = ['.css']
/** @type {string[]}  **/
export const SCRIPT_EXTENSIONS = ['.js', '.mjs', '.cjs']
/** @type {string}  **/
export const LIQUID_EXTENSION = '.liquid'
/** @type {string}  **/
export const JSON_EXTENSION = '.json'

/**
 * Index Component Files
 * @param {string} componentName
 * @param {string} folder
 * @param {ComponentFiles} filesModel
 * @return {Promise<ComponentFiles>}
 */
export async function indexFiles(componentName, folder, filesModel) {
  // Validation: make sure the folder is readable.
  await this.validateFolderAccess(folder, componentName)

  const files = await FileUtils.getFolderFilesRecursively(folder)

  filterFiles(files, filesModel, componentName)

  // Validation: Make sure that a liquid file was found
  if (!filesModel.liquidFile) {
    throw new FileMissingError(`No liquid files file found for the "${componentName}" component`)
  }

  if (files) {
    filesModel.javascriptIndex = JavascriptUtils.findMainJavaScriptFile(files, componentName)
  }

  if (filesModel.stylesheets.length) {
    filesModel.mainStylesheet = StylesUtils.getMainStyleSheet(filesModel.stylesheets, componentName)
  }

  return filesModel
}

/**
 * Filter Component Files by Type
 * @param {string[]} files
 * @param {ComponentFiles} componentFiles
 * @param {string} componentName
 */
function filterFiles(files, componentFiles, componentName) {
  // Categorize files for the build steps
  for (const file of files) {
    const extension = extname(file).toLowerCase()
    const folder = dirname(file).toLowerCase()
    const filename = basename(file).toLowerCase()

    if (folder.includes(join(componentName, SETUP_FOLDER_NAME))) {
      componentFiles.setupFiles.push(file)
      continue
    }

    if (folder.endsWith(`/${ASSETS_FOLDER_NAME}`)) {
      componentFiles.assetFiles.push(file)
      continue
    }

    if (STYLE_EXTENSIONS.includes(extension)) {
      componentFiles.stylesheets.push(file)
      continue
    }

    if (SCRIPT_EXTENSIONS.includes(extension)) {
      componentFiles.javascriptFiles.push(file)
      continue
    }

    switch (extension) {
      case LIQUID_EXTENSION:
        if (filename.split('.')[0] === componentName || filename === 'index.liquid') {
          if (componentFiles.liquidFile) {
            throw new InputFileError(
              `Two main liquid files found for the same component ${componentFiles.liquidFile} and ${file}`
            )
          }
          componentFiles.liquidFile = file
          break
        }
        if (folder.endsWith('/snippets')) {
          componentFiles.snippetFiles.push(file)
          break
        }
        ux.warn(`Ignored liquid file ${filename}`)
        break
      case JSON_EXTENSION:
        if (filename === 'package.json') {
          componentFiles.packageJson = file
          break
        }

        ux.debug(`Filter Files: Unrecognised file; ignoring ${FileUtils.convertToComponentRelativePath(file)}`)
        break

      default:
        ux.debug(`Filter Files: Unrecognised file; ignoring ${FileUtils.convertToComponentRelativePath(file)}`)
        break
    }
  }
}

/**
 * Validate Folder access before indexing files
 * @param {string} folder
 * @param {string} componentName
 * @return {Promise<void>}
 * @throws FileAccessError
 */
export async function validateFolderAccess(folder, componentName) {
  if (!(await FileUtils.isReadable(folder))) {
    ux.debug(`Component Factory Abort: ${componentName} was not found at any expected location: "${folder}".`)
    throw new FileAccessError(
      `Unable to access the "${componentName}" component on disk. Tips: Is it spelled properly? Is the collection installed?`
    )
  }
}

export default {
  indexFiles,
  validateFolderAccess
}
