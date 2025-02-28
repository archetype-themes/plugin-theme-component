export interface ComponentConfig {
  COLLECTION_NAME: string | undefined
  COLLECTION_PACKAGE_JSON: string
  COLLECTION_VERSION: string | undefined
  GENERATE_IMPORT_MAP: boolean
  GENERATE_TEMPLATE_MAP: boolean
  PREVIEW: boolean
  SETUP_FILES: boolean
  THEME_DIR: string | undefined
  THEME_DIRECTORIES: readonly ['layout', 'sections', 'templates', 'blocks']
  WATCH: boolean
}

export interface TomlConfig {
  components?: Partial<ComponentConfig>
}

export interface LiquidNode {
  assets: string[]
  body: string
  file: string
  name: string
  setup: string[]
  snippets: string[]
  themeFolder: 'assets' | 'blocks' | 'config' | 'layout' | 'sections' | 'snippets' | 'templates'
  type: 'asset' | 'component' | 'entry' | 'setup' | 'snippet'
}

export interface PackageJSON {
  author?: { name: string } | string;
  license?: string;
  name: string;
  repository: string;
  version: string;
}

export interface Manifest {
  collections: {
    [name: string]: {
      commit: null | string;
      version: string;
    };
  }
  files: {
    [folder: string]: {
      [name: string]: string;
    };
  }
}

export interface CopyrightConfig {
  author?: string;
  license?: string;
}

export interface CopyrightOptions {
  collectionName?: string;
  collectionVersion?: string;
  copyright?: CopyrightConfig;
}
