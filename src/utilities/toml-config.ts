import * as fs from 'node:fs'
import { parse as parseToml, stringify } from 'smol-toml'
import { TomlConfig, LiquidNode, PackageJSON } from './types.js'

export function getThemeConfig(configFilePath: string): TomlConfig {
  const configContent = fs.readFileSync(configFilePath, 'utf8')
  const parsed = parseToml(configContent) as unknown as TomlConfig

  return {
    COMPONENTS: {
      COLLECTIONS: parsed.COMPONENTS?.COLLECTIONS || {},
      IMPORTMAP: parsed.COMPONENTS?.IMPORTMAP || {}
    }
  }
}

export function updateThemeCollection(configFilePath: string, pkg: PackageJSON): void {
  const configObj = getThemeConfig(configFilePath)
  configObj.COMPONENTS = configObj.COMPONENTS || {}
  configObj.COMPONENTS.COLLECTIONS = configObj.COMPONENTS.COLLECTIONS || {}
  configObj.COMPONENTS.COLLECTIONS[pkg.name] = {
    COLLECTION_VERSION: pkg.version
  }
  const updatedConfigContent = stringify(configObj)
  fs.writeFileSync(configFilePath, updatedConfigContent, 'utf8')
}

export function updateSnippetImportMap(configFilePath: string, snippets: Set<LiquidNode>, collectionName: string): void {
  const configObj = getThemeConfig(configFilePath)
  configObj.COMPONENTS = configObj.COMPONENTS || {}
  configObj.COMPONENTS.IMPORTMAP = configObj.COMPONENTS.IMPORTMAP || {}
  const importMap = { ...configObj.COMPONENTS.IMPORTMAP }
  
  for (const snippet of snippets) {
    importMap[snippet.name] = collectionName
  }
  
  configObj.COMPONENTS.IMPORTMAP = importMap
  const updatedConfigContent = stringify(configObj)
  fs.writeFileSync(configFilePath, updatedConfigContent, 'utf8')
} 