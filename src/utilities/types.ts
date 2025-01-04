export interface ComponentConfig {
  COLLECTIONS: Record<string, CollectionConfig>
  IMPORTMAP: Record<string, string>
  THEME_CLI_CONFIG: string
  COLLECTION_COMPONENT_DIR: string
  COLLECTION_VERSION: string | undefined
  COLLECTION_NAME: string | undefined
  COLLECTION_DEV_DIR: string | undefined
  COLLECTION_DEV_THEME_DIR: string | undefined
  COLLECTION_PACKAGE_JSON: string
  COPY_SETUP_FILES: boolean
  WATCH: boolean
  SYNC: boolean
  THEME_DIRECTORIES: readonly ['layout', 'sections', 'templates', 'blocks']
}

export interface TomlConfig {
  COMPONENTS?: Partial<ComponentConfig>
}

export interface LiquidNode {
  body: string
  file: string 
  name: string
  snippets: string[]
  type: 'asset' | 'block' | 'layout' | 'section' | 'snippet' | 'template'
}

export interface CollectionConfig {
  COLLECTION_COMPONENT_DIR?: string
  COLLECTION_VERSION?: string
  COLLECTION_DEV_DIR?: string
  COLLECTION_DEV_THEME_DIR?: string
  COLLECTION_PACKAGE_JSON?: string
}

export interface PackageJSON {
  name: string;
  repository: string;
  version: string;
} 