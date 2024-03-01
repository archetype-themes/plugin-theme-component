// External Dependencies
import { ux } from '@oclif/core'

// Internal Dependencies
import FileUtils from './FileUtils.js'

/**
 * Finds the main or index JavaScript file within the provided file list
 * @param {string[]} files
 * @param {string} componentName
 * @returns {string | undefined}
 */
export function findMainJavaScriptFile (files, componentName) {
  const regex = this.mainJavaScriptFileRegex(componentName)
  const mainJavaScriptFile = files.find(file => regex.test(file))

  if (!mainJavaScriptFile) {
    return undefined
  }

  ux.debug(`JavaScript Entrypoint found: ${FileUtils.convertToComponentRelativePath(mainJavaScriptFile)}`)

  return mainJavaScriptFile
}

/**
 * @param {string} componentName
 */
export function mainJavaScriptFileRegex (componentName) {
  return new RegExp(`^.+\\/${componentName}\\.(js|mjs)$`)
}

export default { findMainJavaScriptFile, mainJavaScriptFileRegex }
