export interface ComponentConfig {
  THEME_DIR: string | undefined
  COLLECTION_NAME: string | undefined
  COLLECTION_PACKAGE_JSON: string
  COLLECTION_VERSION: string | undefined
  SETUP_FILES: boolean
  GENERATE_IMPORT_MAP: boolean
  GENERATE_TEMPLATE_MAP: boolean
  PREVIEW: boolean
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