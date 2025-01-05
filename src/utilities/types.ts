export interface ComponentConfig {
  COLLECTION_COMPONENT_DIR: string | undefined
  COLLECTION_DEV_DIR: string | undefined
  THEME_DIR: string | undefined
  COLLECTION_NAME: string | undefined
  COLLECTION_PACKAGE_JSON: string
  COLLECTION_VERSION: string | undefined
  collections: Record<string, CollectionConfig>
  SETUP_FILES: boolean
  GENERATE_IMPORT_MAP: boolean
  GENERATE_TEMPLATE_MAP: boolean
  importmap: Record<string, string>
  PREVIEW: boolean
  THEME_CLI_CONFIG: string
  THEME_DIRECTORIES: readonly ['layout', 'sections', 'templates', 'blocks']
  WATCH: boolean
}

export interface TomlConfig {
  components?: Partial<ComponentConfig>
}

export interface LiquidNode {
  body: string
  file: string 
  name: string
  snippets: string[]
  assets: string[]
  type: 'asset' | 'component' | 'entry' | 'snippet' | 'setup'
  themeFolder: 'assets' | 'snippets' | 'templates' | 'blocks' | 'config' | 'sections' | 'layout'
  setup: string[]
}

export interface CollectionConfig {
  COLLECTION_COMPONENT_DIR?: string
  COLLECTION_DEV_DIR?: string
  THEME_DIR?: string
  COLLECTION_PACKAGE_JSON?: string
  COLLECTION_VERSION?: string
}

export interface PackageJSON {
  name: string;
  repository: string;
  version: string;
}

export interface ComponentMap {
  collections: {
    [name: string]: {
      [version: string]: string;
    };
  }
  files: {
    [folder: string]: {
      [name: string]: string;
    };
  }
} 