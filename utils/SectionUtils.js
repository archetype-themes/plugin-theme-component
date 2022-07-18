import { cwd, env } from 'node:process'

/**
 * Detects the package Folder Name
 * @param {string} packageName
 * @returns {string} packageFolder
 */
function detectSectionFolder (packageName) {
  let packageFolder
  if (env.npm_config_local_prefixw)
    packageFolder = env.npm_config_local_prefix
  else {
    packageFolder = cwd()

    if (packageFolder.includes(packageName)) {
      packageFolder = packageFolder.substring(0, packageFolder.lastIndexOf(packageName) + packageName.length)
    } else {
      packageFolder = cwd()
    }
  }
  return packageFolder
}

export {
  detectSectionFolder
}