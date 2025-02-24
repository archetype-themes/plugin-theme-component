import { Flags as OclifFlags } from '@oclif/core'
import { FlagInput } from '@oclif/core/interfaces';

import { ComponentConfig } from './types.js'

export default class Flags {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  static readonly CLEAN = 'clean';
  static readonly COLLECTION_NAME = 'collection-name';
  static readonly COLLECTION_PACKAGE_JSON = 'collection-package-json';
  static readonly COLLECTION_VERSION = 'collection-version';
  static readonly ENVIRONMENT = 'environment';
  static readonly FORMAT = 'format';
  static readonly GENERATE_IMPORT_MAP = 'generate-import-map';
  static readonly GENERATE_TEMPLATE_MAP = 'generate-template-map';
  static readonly HOST = 'host';
  static readonly IGNORE_CONFLICTS = 'ignore-conflicts';
  static readonly IGNORE_OVERRIDES = 'ignore-overrides';
  static readonly LIVE_RELOAD = 'live-reload';
  static readonly LOCALES_DIR = 'locales-dir';
  static readonly MODE = 'mode';
  static readonly PASSWORD = 'password';
  static readonly PORT = 'port';
  static readonly PREVIEW = 'preview';
  static readonly QUIET = 'quiet';
  static readonly SETUP_FILES = 'setup-files';
  static readonly STORE = 'store';
  static readonly STORE_PASSWORD = 'store-password';
  static readonly TARGET = 'target';
  static readonly THEME = 'theme';
  static readonly THEME_DIR = 'theme-dir';
  static readonly WATCH = 'watch';

  private flagValues: Record<string, FlagInput<object>>;
  constructor(flags: Record<string, FlagInput<object>>) {
    this.flagValues = flags
    Object.assign(this, flags)
  }

  static getDefinitions(keys: string[]) {
    return Object.fromEntries(
      keys.map(key => [key, flagDefinitions[key]])
    )
  }

  get values(): Partial<ComponentConfig> {
    return this.flagValues
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flagDefinitions: Record<string, any> = {
  [Flags.CLEAN]: OclifFlags.boolean({
    char: 'c',
    default: false,
    description: 'Clean unused translations before syncing'
  }),

  [Flags.COLLECTION_NAME]: OclifFlags.string({
    char: 'n',
    description: 'Name of the component collection',
  }),

  [Flags.COLLECTION_VERSION]: OclifFlags.string({
    char: 'v',
    description: 'Version of the component collection',
  }),

  [Flags.ENVIRONMENT]: OclifFlags.string({
    description: 'The environment to apply to the current command.',
  }),

  [Flags.FORMAT]: OclifFlags.boolean({
    default: false,
    description: 'Format locale files (sort keys alphabetically)',
  }),

  [Flags.GENERATE_IMPORT_MAP]: OclifFlags.boolean({
    char: 'i',
    default: true,
    description: 'Generate import map',
  }),

  [Flags.GENERATE_TEMPLATE_MAP]: OclifFlags.boolean({
    char: 'm',
    default: true,
    description: 'Generate template map',
  }),

  [Flags.HOST]: OclifFlags.string({
    description: 'Set which network interface the web server listens on. The default value is 127.0.0.1.',
  }),

  [Flags.IGNORE_CONFLICTS]: OclifFlags.boolean({
    char: 'f',
    default: false,
    description: 'Ignore conflicts when mapping components',
  }),

  [Flags.IGNORE_OVERRIDES]: OclifFlags.boolean({
    char: 'o',
    default: false,
    description: 'Ignore overrides when mapping components',
  }),

  [Flags.LIVE_RELOAD]: OclifFlags.boolean({
    description: 'Reload the browser when changes are made.',
  }),

  [Flags.LOCALES_DIR]: OclifFlags.string({
    char: 'l',
    default: 'https://github.com/archetype-themes/locales',
    description: 'Directory or repository containing locale files',
  }),

  [Flags.MODE]: OclifFlags.string({
    char: 'm',
    default: 'add-and-override',
    description: 'Sync mode for locale files:\n' +
      '- add-and-override: Add new translations and override existing ones with source values (default)\n' +
      '- replace-existing: Replace values of existing translations with source values\n' +
      '- add-missing: Only add new translations that do not exist in theme',
    options: ['add-and-override', 'add-missing', 'replace-existing']
  }),

  [Flags.PASSWORD]: OclifFlags.string({
    description: 'Password generated from the Theme Access app.',
  }),

  [Flags.PORT]: OclifFlags.integer({
    description: 'Local port to serve theme preview from.',
  }),

  [Flags.PREVIEW]: OclifFlags.boolean({
    allowNo: true,
    char: 'y',
    default: true,
    description: 'Sync changes to theme directory',
  }),

  [Flags.QUIET]: OclifFlags.boolean({
    allowNo: true,
    char: 'q',
    default: false,
    description: 'Suppress non-essential output'
  }),

  [Flags.SETUP_FILES]: OclifFlags.boolean({
    allowNo: true,
    char: 's',
    default: true,
    description: 'Copy setup files to theme directory',
  }),

  [Flags.STORE]: OclifFlags.string({
    description: 'Store URL. It can be the store prefix (example.myshopify.com) or the complete URL.',
  }),

  [Flags.STORE_PASSWORD]: OclifFlags.string({
    description: 'The password for storefronts with password protection.',
  }),

  [Flags.TARGET]: OclifFlags.string({
    default: 'all',
    description: 'Target for cleaning: all (default), schema, or storefront',
    options: ['all', 'schema', 'storefront']
  }),

  [Flags.THEME]: OclifFlags.string({
    description: 'Theme ID or name of the remote theme.',
  }),

  [Flags.THEME_DIR]: OclifFlags.string({
    char: 't',
    default: 'https://github.com/archetype-themes/explorer',
    description: 'Directory that contains theme files for development',
  }),

  [Flags.WATCH]: OclifFlags.boolean({
    allowNo: true,
    char: 'w',
    default: true,
    description: 'Watch for changes in theme and component directories',
  }),
}
