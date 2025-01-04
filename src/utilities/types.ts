export interface ComponentConfig {
  COLLECTION_COMPONENT_DIR: string
  COLLECTION_DEV_DIR: string | undefined
  COLLECTION_DEV_THEME_DIR: string | undefined
  COLLECTION_NAME: string | undefined
  COLLECTION_PACKAGE_JSON: string
  COLLECTION_VERSION: string | undefined
  COLLECTIONS: Record<string, CollectionConfig>
  COPY_SETUP_FILES: boolean
  GENERATE_IMPORT_MAP: boolean
  GENERATE_TEMPLATE_MAP: boolean
  IMPORTMAP: Record<string, string>
  SYNC: boolean
  THEME_CLI_CONFIG: string
  THEME_DIRECTORIES: readonly ['layout', 'sections', 'templates', 'blocks']
  WATCH: boolean
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
  COLLECTION_DEV_DIR?: string
  COLLECTION_DEV_THEME_DIR?: string
  COLLECTION_PACKAGE_JSON?: string
  COLLECTION_VERSION?: string
}

export interface PackageJSON {
  name: string;
  repository: string;
  version: string;
} 