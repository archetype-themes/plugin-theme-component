import { isGitHubUrl } from './GitUtils.js'
import { getAbsolutePath } from './FileUtils.js'

/**
 * Get a Value From flags or tomlConfig
 * Priority is given to the flag value if both are present
 * @param {string} key
 * @param {Object} flags
 * @param {Object} metadata
 * @param {ComponentTomlConfig|null} tomlConfig
 * @return {string|boolean}
 */
export function getValueFromFlagOrToml(key, flags, metadata, tomlConfig) {
  if (metadata.flags[key]?.setFromDefault && tomlConfig != null && Object.hasOwn(tomlConfig, key)) {
    return tomlConfig[key]
  } else {
    return flags[key]
  }
}

/**
 * Get an array of values from argv input or toml file if available
 * Priority is given to the argv value if both are present
 * @param {string} key
 * @param {string[]} argv
 * @param {ComponentTomlConfig|null} tomlConfig
 * @return {string[]|null} Components list
 */
export function getValuesFromArgvOrToml(key, argv, tomlConfig) {
  if (argv.length) {
    return argv
  }
  if (tomlConfig != null && Object.hasOwn(tomlConfig, key)) {
    return typeof tomlConfig[key] === 'string' ? [tomlConfig[key]] : tomlConfig[key]
  }
  return null
}

/**
 * Get Path Value From flags or tomlConfig
 * Priority is given to the flag value if both are present
 * @param {string} pathName
 * @param {Object} flags
 * @param {Object} metadata
 * @param {ComponentTomlConfig|null} tomlConfig
 * @return {Promise<string>}
 */
export async function getPathFromFlagOrTomlValue(pathName, flags, metadata, tomlConfig) {
  const flagValue = getValueFromFlagOrToml(pathName, flags, metadata, tomlConfig)

  return isGitHubUrl(flagValue) ? flagValue : getAbsolutePath(flagValue)
}
