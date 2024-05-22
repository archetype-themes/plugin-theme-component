// Internal Dependencies
import { convertToComponentRelativePath } from './FileUtils.js'
import { debug } from './LoggerUtils.js'

/**
 * Finds the main or index JavaScript file within the provided file list
 * @param {string[]} files
 * @param {string} componentName
 * @returns {string | undefined}
 */
export function findMainJavaScriptFile(files, componentName) {
  const regex = mainJavaScriptFileRegex(componentName)
  const mainJavaScriptFile = files.find((file) => regex.test(file))

  if (!mainJavaScriptFile) {
    return undefined
  }

  debug(`JavaScript Entrypoint found: ${convertToComponentRelativePath(mainJavaScriptFile)}`)

  return mainJavaScriptFile
}

/**
 * @param {string} componentName
 */
export function mainJavaScriptFileRegex(componentName) {
  return new RegExp(`^.+\\/${componentName}\\.(js|mjs)$`)
}
