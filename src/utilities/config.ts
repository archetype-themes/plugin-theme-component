import * as fs from 'node:fs'
import * as path from 'node:path'
import { parse as parseToml } from 'smol-toml'
import Flags from './flags.js'

interface TomlConfig {
  components?: {
    collections?: Record<string, {
      repository?: string
      version?: string
    }>
    importmap?: Record<string, string>
  }
}

export interface ThemeComponentConfigData {
  // Config from shopify.theme.toml
  COLLECTIONS?: Record<string, {
    repository?: string
    version?: string
  }>
  IMPORTMAP?: Record<string, string>

  // Runtime config from flags - matches Flags.* definitions
  THEME_CLI_CONFIG: string
  COLLECTION_COMPONENT_DIR: string
  COLLECTION_NAME?: string
  COLLECTION_DEV_DIR?: string
  COLLECTION_DEV_THEME_DIR?: string
  COLLECTION_PACKAGE_JSON: string
  COPY_SETUP_FILES?: boolean
  WATCH?: boolean
  SYNC?: boolean
}

let config: ThemeComponentConfigData | undefined

export function initializeConfig(flags: Flags, configPath?: string): void {
  if (config) return // Only initialize once

  // Initialize with default config
  config = {
    THEME_CLI_CONFIG: 'shopify.theme.toml',
    COLLECTION_COMPONENT_DIR: './components',
    COLLECTION_PACKAGE_JSON: './package.json',
    COPY_SETUP_FILES: true,
    WATCH: false,
    SYNC: false,
  }

  // Load TOML config if it exists
  if (configPath && fs.existsSync(configPath)) {
    const tomlConfig = parseToml(fs.readFileSync(configPath, 'utf-8')) as TomlConfig
    config = {
      ...config,
      COLLECTIONS: tomlConfig.components?.collections,
      IMPORTMAP: tomlConfig.components?.importmap
    }
  }

  // Override with flag values - direct 1:1 mapping with Flags.*
  config = {
    ...config,
    THEME_CLI_CONFIG: flags[Flags.THEME_CLI_CONFIG] ?? config.THEME_CLI_CONFIG,
    COLLECTION_COMPONENT_DIR: flags[Flags.COLLECTION_COMPONENT_DIR] ?? config.COLLECTION_COMPONENT_DIR,
    COLLECTION_NAME: flags[Flags.COLLECTION_NAME],
    COLLECTION_DEV_DIR: flags[Flags.COLLECTION_DEV_DIR],
    COLLECTION_DEV_THEME_DIR: flags[Flags.COLLECTION_DEV_THEME_DIR],
    COPY_SETUP_FILES: flags[Flags.COPY_SETUP_FILES],
    WATCH: flags[Flags.WATCH],
    SYNC: flags[Flags.SYNC]
  }
}

function getConfig(): ThemeComponentConfigData {
  if (!config) {
    throw new Error('Config not initialized. Call initializeConfig() first.')
  }
  return config
}

// Create the config proxy
export const themeComponentConfig = new Proxy({} as ThemeComponentConfigData, {
  get(target, prop) {
    return getConfig()[prop as keyof ThemeComponentConfigData]
  }
})

export default themeComponentConfig 