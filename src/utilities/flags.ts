import {Flags as OclifFlags} from '@oclif/core'

import { ComponentConfig } from './types.js'

export let flagDefinitions: Record<string, any>;

export default class Flags {
  [key: string]: any;
  static readonly THEME_DIR = 'theme-dir';
  static readonly COLLECTION_NAME = 'collection-name';
  static readonly COLLECTION_PACKAGE_JSON = 'collection-package-json';
  static readonly COLLECTION_VERSION = 'collection-version';
  static readonly SETUP_FILES = 'setup-files';
  static readonly PREVIEW = 'preview';
  static readonly WATCH = 'watch';
  static readonly GENERATE_IMPORT_MAP = 'generate-import-map';
  static readonly GENERATE_TEMPLATE_MAP = 'generate-template-map';
  static readonly IGNORE_CONFLICTS = 'ignore-conflicts';
  static readonly IGNORE_OVERRIDES = 'ignore-overrides';
  static readonly CLEAN = 'clean';
  static readonly QUIET = 'quiet';

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
  [Flags.THEME_DIR]: OclifFlags.string({
    char: 't',
    default: 'https://github.com/archetype-themes/explorer',
    description: 'directory that contains theme files for development',
  }),

  [Flags.COLLECTION_NAME]: OclifFlags.string({
    char: 'n',
    description: 'name of the component collection',
  }),

  [Flags.SETUP_FILES]: OclifFlags.boolean({
    char: 's',
    default: true,
    description: 'copy setup files to theme directory',
  }),

  [Flags.PREVIEW]: OclifFlags.boolean({
    char: 'y',
    default: true,
    description: 'sync changes to theme directory',
    allowNo: true,
  }),

  [Flags.WATCH]: OclifFlags.boolean({
    char: 'w',
    default: true,
    description: 'watch for changes in theme and component directories',
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

  [Flags.CLEAN]: OclifFlags.boolean({
    description: 'Clean the theme directory before copying components',
    default: false
  }),

  [Flags.QUIET]: OclifFlags.boolean({
    char: 'q',
    description: 'suppress non-essential output',
    default: false,
    allowNo: true
  }),

  [Flags.COLLECTION_VERSION]: OclifFlags.string({
    char: 'v',
    description: 'version of the component collection',
  })
}
