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

// Locale-related types
export type CleanTarget = 'all' | 'schema' | 'storefront'

export interface LocaleOptions {
  format?: boolean
}

export interface CleanOptions extends LocaleOptions {
  target?: CleanTarget
}

export type SyncMode = 'add-and-override' | 'add-missing' | 'replace-existing'

export interface SyncOptions extends LocaleOptions {
  mode?: SyncMode
  target?: CleanTarget
}

export interface LocaleContent {
  [key: string]: Record<string, unknown>
}

export interface LocaleDiff {
  added: Set<string>
  modified: Set<string>
  removed: Set<string>
}

export interface TranslationKeysUsedInTheme {
  schema: Set<string>
  storefront: Set<string>
}
