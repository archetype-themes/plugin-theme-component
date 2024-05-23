// External Dependencies
import { basename, dirname, extname, join } from 'node:path'

// Internal Dependencies
import { convertToComponentRelativePath, getFolderFilesRecursively, isReadable } from './FileUtils.js'
import { findMainJavaScriptFile } from './JavascriptUtils.js'
import { getMainStyleSheet } from './StylesUtils.js'
import { ASSETS_FOLDER_NAME, SETUP_FOLDER_NAME } from '../config/Components.js'
import FileAccessError from '../errors/FileAccessError.js'
import FileMissingError from '../errors/FileMissingError.js'
import InputFileError from '../errors/InputFileError.js'
import { debug, warn } from './LoggerUtils.js'

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
 * @param {ComponentFiles} componentFiles
 * @return {Promise<ComponentFiles>}
 */
export async function indexFiles(componentName, folder, componentFiles) {
  // Validation: make sure the folder is readable.
  await validateFolderAccess(folder, componentName)

  const files = await getFolderFilesRecursively(folder)

  // Sort Component files
  for (const file of files) {
    sortComponentFile(file, componentFiles, componentName)
  }

  // Validation: Make sure that a liquid file was found
  if (!componentFiles.liquidFile) {
    throw new FileMissingError(`No liquid files file found for the "${componentName}" component`)
  }

  if (files) {
    componentFiles.javascriptIndex = findMainJavaScriptFile(files, componentName)
  }

  if (componentFiles.stylesheets.length) {
    componentFiles.mainStylesheet = getMainStyleSheet(componentFiles.stylesheets, componentName)
  }

  return componentFiles
}

/**
 * Sort Component File
 * @param {string} file
 * @param {ComponentFiles} componentFiles
 * @param {string} componentName
 */
function sortComponentFile(file, componentFiles, componentName) {
  const extension = extname(file).toLowerCase()
  const folder = dirname(file).toLowerCase()
  const filename = basename(file).toLowerCase()

  if (folder.includes(join(componentName, SETUP_FOLDER_NAME))) {
    componentFiles.setupFiles.push(file)
  } else if (folder.endsWith(`/${ASSETS_FOLDER_NAME}`)) {
    componentFiles.assetFiles.push(file)
  } else if (STYLE_EXTENSIONS.includes(extension)) {
    componentFiles.stylesheets.push(file)
  } else if (SCRIPT_EXTENSIONS.includes(extension)) {
    componentFiles.javascriptFiles.push(file)
  } else if (extension === LIQUID_EXTENSION) {
    if (folder.endsWith('/snippets')) {
      componentFiles.snippetFiles.push(file)
    } else if (filename.split('.')[0] === componentName || filename === 'index.liquid') {
      if (componentFiles.liquidFile) {
        throw new InputFileError(
          `Two main liquid files found for the same component ${componentFiles.liquidFile} and ${file}`
        )
      }
      componentFiles.liquidFile = file
    } else {
      warn(`Ignored liquid file ${filename}`)
    }
  }

  debug(`Filter Files: Unrecognised file; ignoring ${convertToComponentRelativePath(file)}`)
}

/**
 * Validate Folder access before indexing files
 * @param {string} folder
 * @param {string} componentName
 * @return {Promise<void>}
 * @throws FileAccessError
 */
export async function validateFolderAccess(folder, componentName) {
  if (!(await isReadable(folder))) {
    debug(`Component Factory Abort: ${componentName} was not found at any expected location: "${folder}".`)
    throw new FileAccessError(
      `Unable to access the "${componentName}" component on disk. Tips: Is it spelled properly? Is the collection installed?`
    )
  }
}
