import {Flags as OclifFlags} from '@oclif/core'
import { FlagInput } from '@oclif/core/interfaces';

import { ComponentConfig } from './types.js'

export default class Flags {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  static readonly CLEAN = 'clean';
  static readonly COLLECTION_NAME = 'collection-name';
  static readonly COLLECTION_PACKAGE_JSON = 'collection-package-json';
  static readonly COLLECTION_VERSION = 'collection-version';
  static readonly ENVIRONMENT = 'environment';
  static readonly GENERATE_IMPORT_MAP = 'generate-import-map';
  static readonly GENERATE_TEMPLATE_MAP = 'generate-template-map';
  static readonly HOST = 'host';
  static readonly IGNORE_CONFLICTS = 'ignore-conflicts';
  static readonly IGNORE_OVERRIDES = 'ignore-overrides';
  static readonly LIVE_RELOAD = 'live-reload';
  static readonly PASSWORD = 'password';
  static readonly PORT = 'port';
  static readonly PREVIEW = 'preview';
  static readonly QUIET = 'quiet';
  static readonly SCHEMA_LOCALES = 'schema-locales';
  static readonly SETUP_FILES = 'setup-files';
  static readonly STORE = 'store';
  static readonly STORE_PASSWORD = 'store-password';
  static readonly STOREFRONT_LOCALES = 'storefront-locales';
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
    default: false,
    description: 'Clean the theme directory before copying components'
  }),

  [Flags.COLLECTION_NAME]: OclifFlags.string({
    char: 'n',
    description: 'name of the component collection',
  }),

  [Flags.COLLECTION_VERSION]: OclifFlags.string({
    char: 'v',
    description: 'version of the component collection',
  }),

  [Flags.ENVIRONMENT]: OclifFlags.string({
    description: 'The environment to apply to the current command.',
  }),

  [Flags.GENERATE_IMPORT_MAP]: OclifFlags.boolean({
    char: 'i',
    default: true,
    description: 'generate import map',
  }),

  [Flags.GENERATE_TEMPLATE_MAP]: OclifFlags.boolean({
    char: 'm',
    default: true,
    description: 'generate template map',
  }),

  [Flags.HOST]: OclifFlags.string({
    description: 'Set which network interface the web server listens on. The default value is 127.0.0.1.',
  }),

  [Flags.IGNORE_CONFLICTS]: OclifFlags.boolean({
    char: 'f',
    default: false,
    description: 'ignore conflicts when mapping components',
  }),

  [Flags.IGNORE_OVERRIDES]: OclifFlags.boolean({
    char: 'o',
    default: false,
    description: 'ignore overrides when mapping components',
  }),

  [Flags.LIVE_RELOAD]: OclifFlags.boolean({
    description: 'Reload the browser when changes are made.',
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
    description: 'sync changes to theme directory',
  }),

  [Flags.QUIET]: OclifFlags.boolean({
    allowNo: true,
    char: 'q',
    default: false,
    description: 'suppress non-essential output'
  }),

  [Flags.SCHEMA_LOCALES]: OclifFlags.boolean({
    allowNo: true,
    char: 's',
    default: true,
    description: 'Clean translations from schema locale files'
  }),

  [Flags.SETUP_FILES]: OclifFlags.boolean({
    allowNo: true,
    char: 's',
    default: true,
    description: 'copy setup files to theme directory',
  }),

  [Flags.STORE]: OclifFlags.string({
    description: 'Store URL. It can be the store prefix (example.myshopify.com) or the complete URL.',
  }),

  [Flags.STORE_PASSWORD]: OclifFlags.string({
    description: 'The password for storefronts with password protection.',
  }),

  [Flags.STOREFRONT_LOCALES]: OclifFlags.boolean({
    allowNo: true,
    char: 'f',
    default: true,
    description: 'Clean translations from storefront locale files'
  }),

  [Flags.THEME]: OclifFlags.string({
    description: 'Theme ID or name of the remote theme.',
  }),

  [Flags.THEME_DIR]: OclifFlags.string({
    char: 't',
    default: 'https://github.com/archetype-themes/explorer',
    description: 'directory that contains theme files for development',
  }),

  [Flags.WATCH]: OclifFlags.boolean({
    allowNo: true,
    char: 'w',
    default: true,
    description: 'watch for changes in theme and component directories',
  }),

}
