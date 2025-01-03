import {Flags as OclifFlags, Command} from '@oclif/core'

export default class Flags {
  private flagValues: Record<string, any>;
  [key: string]: any;

  constructor(flags: Record<string, any>) {
    this.flagValues = flags;
    return new Proxy(this, {
      get: (target, prop: string) => {
        if (prop in target) {
          return target[prop];
        }
        const group = Flags.flagDefinitions[prop as keyof typeof Flags.flagDefinitions];
        if (group) {
          const [key] = Object.keys(group);
          return target.flagValues[key];
        }
      }
    });
  }

  static readonly THEME_CLI_CONFIG = 'THEME_CLI_CONFIG' as const;
  static readonly COLLECTION_COMPONENT_DIR = 'COLLECTION_COMPONENT_DIR' as const;
  static readonly COLLECTION_NAME = 'COLLECTION_NAME' as const;
  static readonly COLLECTION_DEV_DIR = 'COLLECTION_DEV_DIR' as const;
  static readonly COLLECTION_DEV_THEME_DIR = 'COLLECTION_DEV_THEME_DIR' as const;
  static readonly COPY_SETUP_FILES = 'COPY_SETUP_FILES' as const;
  static readonly WATCH = 'WATCH' as const;
  static readonly SYNC = 'SYNC' as const;
  static readonly COLLECTION_PACKAGE_JSON = 'COLLECTION_PACKAGE_JSON' as const;

  static readonly flagDefinitions = {
    [Flags.THEME_CLI_CONFIG]: {
      config: OclifFlags.string({
        char: 'c',
        default: 'shopify.theme.toml',
        description: 'path to the config file',
      }),
    },

    [Flags.COLLECTION_COMPONENT_DIR]: {
      components: OclifFlags.string({
        char: 'd',
        default: './components',
        description: 'directory that contains components',
      }),
    },

    [Flags.COLLECTION_NAME]: {
      name: OclifFlags.string({
        char: 'n',
        default: '',
        description: 'component collection name',
      }),
    },

    [Flags.COLLECTION_DEV_DIR]: {
      devDirectory: OclifFlags.string({
        char: 'd',
        default: '.dev',
        description: 'directory to stage your component in',
      }),
    },

    [Flags.COLLECTION_DEV_THEME_DIR]: {
      themeDir: OclifFlags.string({
        summary: 'Path to the theme directory',
        description: "The path to your theme should point to a GitHub URL or a local path. This defaults to Archetype Themes' publicly shared component explorer theme.",
        helpGroup: 'Path',
        helpValue: '<path-or-github-url>',
        char: 't',
        default: 'https://github.com/archetype-themes/explorer'
      }),
    },

    [Flags.COPY_SETUP_FILES]: {
      setupFiles: OclifFlags.boolean({
        summary: 'Copy component setup files',
        description: 'Installs component setup files in your dev theme to help stage them. Typically used in conjuction with the explorer theme.',
        char: 's',
        default: true,
        allowNo: true
      }),
    },

    [Flags.WATCH]: {
      watch: OclifFlags.boolean({
        summary: 'Watch for file changes',
        description: 'Any changes to component and theme source files triggers a file copy and theme build if necessary.',
        char: 'w',
        default: true,
        allowNo: true
      }),
    },

    [Flags.SYNC]: {
      sync: OclifFlags.boolean({
        summary: 'Sync your files through shopify theme dev',
        description: 'This will execute `shopify theme dev --path .dev` along with your component dev command. You can customize options for that command in your toml file.',
        default: true,
        allowNo: true
      }),
    },

    [Flags.COLLECTION_PACKAGE_JSON]: {
      packageJson: OclifFlags.string({
        description: 'path to the collection package.json file',
        env: 'COLLECTION_PACKAGE_JSON',
        default: './package.json'
      }),
    },
  } as const;

  static getDefinitions(flagKeys: (keyof typeof Flags.flagDefinitions)[]): Record<string, any> {
    return flagKeys.reduce((acc, key) => ({
      ...acc,
      ...Flags.flagDefinitions[key],
    }), {})
  }
}