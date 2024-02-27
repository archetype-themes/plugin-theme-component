import * as toml from '@iarna/toml'
import FileUtils from './FileUtils.js'
import { CONFIG_FILE_NAME } from '../config/CLI.js'

/**
 * @typedef {Object} ComponentTomlConfig
 * @property {string} [component] - Component Name
 * @property {string} [theme-path] - Path to a Shopify theme
 * @property {string} [locales-path] - Path to the locales repo
 * @property {boolean} [setup-files=true] - Copy Setup Files
 * @property {boolean} [watch=true] - Watch for file changes
 */

/**
 *
 * @return {Promise<ComponentTomlConfig|null>}
 */
export async function getTomlConfig () {
  if (!await FileUtils.isReadable(CONFIG_FILE_NAME)) {
    return null
  }

  const fileContents = await FileUtils.getFileContents(CONFIG_FILE_NAME)
  const normalizedInput = fileContents.replace(/\r\n$/g, '\n')
  const tomlConfig = toml.parse(normalizedInput)

  return tomlConfig.component || null
}

export default { getTomlConfig }
