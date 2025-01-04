import {Flags as OclifFlags} from '@oclif/core'

import { ComponentConfig } from './types.js'

export let flagDefinitions: Record<string, any>;

export default class Flags {
  [key: string]: any;
  static readonly COLLECTION_COMPONENT_DIR = 'collection-components-dir';
  static readonly COLLECTION_DEV_DIR = 'collection-dev-dir';
  static readonly COLLECTION_DEV_THEME_DIR = 'collection-dev-theme-dir';
  static readonly COLLECTION_NAME = 'collection-name';
  static readonly COLLECTION_PACKAGE_JSON = 'collection-package-json';
  static readonly COPY_SETUP_FILES = 'copy-setup-files';
  static readonly SYNC = 'sync';
  static readonly THEME_CLI_CONFIG = 'theme-cli-config';

  static readonly WATCH = 'watch';

  private flagValues: Record<string, any>;
  constructor(flags: Record<string, any>) {
    this.flagValues = flags
    return new Proxy(this, {
      get(target: Flags, prop: string | symbol): any {
        if (prop in target) {
          return (target as any)[prop]
        }

        return target.flagValues[prop.toString()]
      }
    })
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

flagDefinitions = {
  [Flags.COLLECTION_COMPONENT_DIR]: OclifFlags.string({
    char: 'd',
    default: './components',
    description: 'directory that contains components',
  }),

  [Flags.COLLECTION_DEV_DIR]: OclifFlags.string({
    char: 'o',
    default: './.dev',
    description: 'directory to output development files',
  }),

  [Flags.COLLECTION_DEV_THEME_DIR]: OclifFlags.string({
    char: 't',
    default: './theme',
    description: 'directory that contains theme files for development',
  }),

  [Flags.COLLECTION_NAME]: OclifFlags.string({
    char: 'n',
    description: 'name of the component collection',
  }),

  [Flags.COPY_SETUP_FILES]: OclifFlags.boolean({
    char: 's',
    default: true,
    description: 'copy setup files to theme directory',
  }),

  [Flags.SYNC]: OclifFlags.boolean({
    char: 'y',
    default: true,
    description: 'sync changes to theme directory',
  }),

  [Flags.THEME_CLI_CONFIG]: OclifFlags.string({
    char: 'c',
    default: './shopify.theme.toml',
    description: 'path to the Shopify Theme CLI config file (typically shopify.theme.toml)',
  }),

  [Flags.WATCH]: OclifFlags.boolean({
    char: 'w',
    default: true,
    description: 'watch for changes in theme and component directories',
  })
}