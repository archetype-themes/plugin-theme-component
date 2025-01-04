import * as fs from 'node:fs'
import * as path from 'node:path'

import Flags from './flags.js'
import { getThemeConfig, updateSnippetImportMap, updateThemeCollection } from './toml-config.js'
import { CollectionConfig, ComponentConfig, LiquidNode, PackageJSON } from './types.js'

let config: ComponentConfig | undefined

const DEFAULT_CONFIG: ComponentConfig = {
  COLLECTION_COMPONENT_DIR: './components',
  COLLECTION_DEV_DIR: './dev',
  COLLECTION_DEV_THEME_DIR: 'https://github.com/archetype-themes/explorer',
  COLLECTION_NAME: undefined,
  COLLECTION_PACKAGE_JSON: './package.json',
  COLLECTION_VERSION: undefined,
  COLLECTIONS: {},
  COPY_SETUP_FILES: true,
  IMPORTMAP: {},
  SYNC: false,
  THEME_CLI_CONFIG: './shopify.theme.toml',
  THEME_DIRECTORIES: ['layout', 'sections', 'templates', 'blocks'] as const,
  WATCH: false
}

// Collection-specific config keys that can be overridden
const COLLECTION_KEYS = [
  'COLLECTION_COMPONENT_DIR',
  'COLLECTION_VERSION',
  'COLLECTION_DEV_DIR',
  'COLLECTION_DEV_THEME_DIR',
  'COLLECTION_PACKAGE_JSON',
] as const

export async function getCollectionInfo(): Promise<PackageJSON> {
  const pkgPath = path.join(process.cwd(), path.basename(themeComponentConfig.COLLECTION_PACKAGE_JSON));
  const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf8'));
  return {
    name: pkg.name,
    repository: pkg.repository,
    version: pkg.version
  };
}

export async function updateThemeConfig(filesCopied: Set<LiquidNode>, themeDir: string): Promise<void> {
  const configFilePath = path.join(themeDir, themeComponentConfig.THEME_CLI_CONFIG)
  const pkg = await getCollectionInfo()
  const collectionName = await getCollectionName()
  
  updateThemeCollection(configFilePath, pkg)
  updateSnippetImportMap(configFilePath, filesCopied, collectionName)
}

export function initializeConfig(flags: Flags, configPath?: string, themeDir?: string): void {
  if (config) return // Only initialize once

  // Start with default config
  config = { ...DEFAULT_CONFIG }

  // If we have a theme directory and a relative config path, make it absolute
  const resolvedConfigPath = themeDir && configPath 
    ? path.join(themeDir, configPath)
    : configPath

  // Override with TOML config if it exists
  if (resolvedConfigPath && fs.existsSync(resolvedConfigPath)) {
    const tomlConfig = getThemeConfig(resolvedConfigPath)
    if (tomlConfig.COMPONENTS) {
      Object.assign(config, tomlConfig.COMPONENTS)
    }
  }

  // Get all static SNAKE_CASE keys from Flags class
  const staticKeys = Object.getOwnPropertyNames(Flags)
    .filter(key => key === key.toUpperCase())

  // Map flag values using static properties as keys, filtering out undefined values
  const flagValues = Object.fromEntries(
    staticKeys
      .map(key => [key, flags[Flags[key as keyof typeof Flags] as string]])
      .filter(([_, value]) => value !== undefined)
  )

  Object.assign(config, flagValues)
}

function getConfig(): ComponentConfig {
  if (!config) {
    throw new Error('Config not initialized. Call initializeConfig() first.')
  }

  return config
}

async function getCollectionName(): Promise<string> {
  const config = getConfig()
  if (config.COLLECTION_NAME) return config.COLLECTION_NAME
  const pkg = await getCollectionInfo()
  return pkg.name
}

// Create the config proxy
export const themeComponentConfig = new Proxy({} as ComponentConfig, {
  get(target, prop) {
    const config = getConfig()
    
    if (prop === 'COLLECTION_NAME') {
      return getCollectionName()
    }

    // Check for collection-specific override if the property is a collection key
    if (COLLECTION_KEYS.includes(prop as typeof COLLECTION_KEYS[number])) {
      const collectionName = config.COLLECTION_NAME
      if (collectionName && config.COLLECTIONS[collectionName]) {
        const key = prop as keyof CollectionConfig
        const collectionValue = config.COLLECTIONS[collectionName][key]
        if (collectionValue !== undefined) {
          return collectionValue
        }
      }
    }

    return config[prop as keyof ComponentConfig]
  }
})

export default themeComponentConfig 