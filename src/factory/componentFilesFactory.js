// External Dependencies
import { dirname, join, sep } from 'node:path'

// Internal Dependencies
import {
  convertToComponentRelativePath,
  getFileType,
  getFolderFilesRecursively,
  isReadable
} from '../utils/fileUtils.js'
import { ASSETS_FOLDER_NAME, FileTypes, SETUP_FOLDER_NAME } from '../config/constants.js'
import FileAccessError from '../errors/FileAccessError.js'
import FileMissingError from '../errors/FileMissingError.js'
import InputFileError from '../errors/InputFileError.js'
import { debug } from '../utils/logger.js'
import ComponentFiles from '../models/ComponentFiles.js'

/**
 * Index Component Files
 * @param {string} componentName
 * @param {string} folder
 * @return {Promise<ComponentFiles>}
 */
export async function componentFilesFactory(componentName, folder) {
  // Validation: make sure the folder is readable.
  await validateFolderAccess(folder, componentName)

  const files = await getFolderFilesRecursively(folder)

  const componentFiles = new ComponentFiles()
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
    componentFiles.mainStylesheet = findMainStyleSheetFile(componentFiles.stylesheets, componentName)
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
  const fileType = getFileType(file)
  const folder = dirname(file).toLowerCase()

  if (folder.includes(join(componentName, SETUP_FOLDER_NAME))) {
    componentFiles.setupFiles.push(file)
  } else if (fileType === FileTypes.Javascript) {
    componentFiles.javascriptFiles.push(file)
  } else if (folder.endsWith(`/${ASSETS_FOLDER_NAME}`)) {
    componentFiles.assetFiles.push(file)
  } else if (fileType === FileTypes.Css) {
    componentFiles.stylesheets.push(file)
  } else if (fileType === FileTypes.Liquid) {
    if (folder.endsWith(`${sep}snippets`)) {
      componentFiles.snippetFiles.push(file)
    } else {
      if (componentFiles.liquidFile) {
        throw new InputFileError(
          `Two main liquid files found for the same component ${componentFiles.liquidFile} and ${file}`
        )
      }
      componentFiles.liquidFile = file
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
async function validateFolderAccess(folder, componentName) {
  if (!(await isReadable(folder))) {
    debug(`Component Factory Abort: ${componentName} was not found at any expected location: "${folder}".`)
    throw new FileAccessError(
      `Unable to access the "${componentName}" component on disk. Tips: Is it spelled properly? Is the collection installed?`
    )
  }
}

/**
 * Finds the main or index JavaScript file within the provided file list
 * @param {string[]} files
 * @param {string} componentName
 * @returns {string | undefined}
 */
function findMainJavaScriptFile(files, componentName) {
  const regex = new RegExp(`^.+\\/${componentName}\\.(js|mjs)$`)
  const mainJavaScriptFile = files.find((file) => regex.test(file))

  if (!mainJavaScriptFile) {
    return undefined
  }

  debug(`JavaScript Entrypoint found: ${convertToComponentRelativePath(mainJavaScriptFile)}`)

  return mainJavaScriptFile
}

/**
 * Find the Main StyleSheet within the provided file list
 * @param {string[]} styleSheets
 * @param {string} componentName
 * @returns {string}
 * @throws Error
 */
function findMainStyleSheetFile(styleSheets, componentName) {
  // If there's only 1 Stylesheet file, take it!
  if (styleSheets.length === 1) {
    return styleSheets[0]
  } else {
    const regex = new RegExp(`[/\\\\]((?:index|main|${componentName}).css)$`, 'i')
    const matches = []
    for (const styleSheet of styleSheets) {
      const match = RegExp(regex).exec(styleSheet)
      if (match) {
        matches.push(match.input)
      }
    }

    if (matches.length === 1) {
      debug(`Main StyleSheet Found: ${convertToComponentRelativePath(matches[0])}`)
      return matches[0]
    } else if (matches.length === 0) {
      throw new FileMissingError('An index or main StyleSheet file could not be found.')
    }

    throw new InputFileError('Only one index or main StyleSheet file is allowed but multiple matches were found.')
  }
}
