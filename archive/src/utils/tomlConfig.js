import * as toml from '@iarna/toml'
import { getFileContents, isReadable } from './fileUtils.js'

import { CONFIG_FILE_NAME } from '../config/constants.js'

/**
 * @typedef {Object} ComponentTomlConfig
 * @property {string} [component] - Component Name
 * @property {string} [theme-path] - Path to a Shopify theme
 * @property {boolean} [setup-files=true] - Copy Setup Files
 * @property {boolean} [watch=true] - Watch for file changes
 * @property {string[]} [exclude] - Watch for file changes
 */

/**
 *
 * @return {Promise<ComponentTomlConfig|null>}
 */
export async function getTomlConfig() {
  if (!(await isReadable(CONFIG_FILE_NAME))) {
    return null
  }

  const fileContents = await getFileContents(CONFIG_FILE_NAME)
  const normalizedInput = fileContents.replace(/\r\n$/g, '\n')
  const tomlConfig = toml.parse(normalizedInput)

  return tomlConfig.component || null
}
