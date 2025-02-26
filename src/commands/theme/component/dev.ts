/**
 * This command sets up a sandboxed development environment for components.
 *
 * - Removes any existing development directory
 * - Copies dev theme files and rendered component files into a temporary development directory
 * - Watches for changes to synchronize updates
 * - Runs 'shopify theme dev' on the temporary development directory to preview your work
 */

import chokidar from 'chokidar'
import path from 'node:path'
import { URL } from 'node:url'

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import { cleanDir, syncFiles } from '../../../utilities/files.js'
import Flags from '../../../utilities/flags.js'
import { cloneTheme } from '../../../utilities/git.js'
import { copySetupComponentFiles } from '../../../utilities/setup.js'
import GenerateTemplateMap from '../generate/template-map.js'
import Install from './install.js'

interface BuildThemeParams {
  componentSelector: string
  generateTemplateMap: boolean
  setupFiles: boolean
  themeDir: string
}

export default class Dev extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.COMPONENT_SELECTOR
  ])

  static override description = 'Start a sandboxed development environment for components'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> header',
    '<%= config.bin %> <%= command.id %> header,footer,navigation'
  ]

  static override flags = Flags.getDefinitions([
    Flags.COLLECTION_NAME,
    Flags.COLLECTION_VERSION,
    Flags.THEME_DIR,
    Flags.SETUP_FILES,
    Flags.WATCH,
    Flags.PREVIEW,
    Flags.GENERATE_IMPORT_MAP,
    Flags.GENERATE_TEMPLATE_MAP,
    Flags.HOST,
    Flags.LIVE_RELOAD,
    Flags.PORT,
    Flags.STORE_PASSWORD,
    Flags.THEME,
    Flags.STORE,
    Flags.ENVIRONMENT,
    Flags.PASSWORD
  ])

  protected override async init(): Promise<void> {
    await super.init(Dev)
  }

  public async run(): Promise<void> {
    const componentSelector = this.args[Args.COMPONENT_SELECTOR]
    const generateTemplateMap = this.flags[Flags.GENERATE_TEMPLATE_MAP]
    const setupFiles = this.flags[Flags.SETUP_FILES]
    const preview = this.flags[Flags.PREVIEW]
    const watch = this.flags[Flags.WATCH]

    const collectionDir = process.cwd()
    const componentsDir = path.join(collectionDir, 'components')
    const devDir = path.join(process.cwd(), '.dev')

    // Remove the existing dev directory if it exists
    cleanDir(devDir)

    // Get theme directory
    const themeDir = await this.getThemeDirectory(devDir)

    this.log(`Building theme in ${devDir}...`)

    const buildThemeParams: BuildThemeParams = {
      componentSelector,
      generateTemplateMap,
      setupFiles,
      themeDir
    }

    await this.buildTheme(devDir, buildThemeParams)

    // Run shopify theme dev if preview is enabled
    if (preview) {
      const additionalArgs = this.getThemeDevFlags()
      await this.config.runCommand(`theme:dev`, ['--path', devDir, ...additionalArgs])
    }

    // Setup file watcher if watch is enabled
    if (watch) {
      return this.setupWatcher(devDir, themeDir, componentsDir, buildThemeParams)
    }
  }

  private async buildTheme(destination: string, params: BuildThemeParams): Promise<void> {
    // Copy the theme files to the dev directory
    syncFiles(params.themeDir, destination)

    // Copy the component setup files if needed
    if (params.setupFiles) {
      await copySetupComponentFiles(
        process.cwd(),
        destination,
        params.componentSelector
      )
    }

    // Install the components
    await Install.run([destination])

    // Generate the template map that is used by explorer
    if (params.generateTemplateMap && params.setupFiles) {
      await GenerateTemplateMap.run([destination, '--quiet'])
    }
  }

  private getThemeDevFlags(): string[] {
    const themeDevFlags = new Set([
      'host',
      'live-reload',
      'port',
      'store-password',
      'theme',
      'store',
      'environment',
      'password',
      'path'
    ])

    return Object.entries(this.flags.values)
      .filter(([key]) => themeDevFlags.has(key))
      .map(([key, value]): null | string => {
        if (typeof value === 'boolean') {
          return value ? `--${key}` : null
        }

        return value ? `--${key}=${value}` : null
      })
      .filter((arg): arg is string => arg !== null)
  }

  private async getThemeDirectory(devDir: string): Promise<string> {
    if (this.flags[Flags.THEME_DIR].startsWith('http')) {
      const url = new URL(this.flags[Flags.THEME_DIR])
      const { host } = url

      if (host === 'github.com' || host.endsWith('.github.com')) {
        const themeDir = path.join(devDir, '.repo')
        this.log(`Cloning theme from ${this.flags[Flags.THEME_DIR]} into dev directory ${devDir}`)
        await cloneTheme(this.flags[Flags.THEME_DIR], themeDir)
        return themeDir
      }

      throw new Error(`Unsupported theme URL: ${this.flags[Flags.THEME_DIR]}`)
    }

    return path.resolve(process.cwd(), this.flags[Flags.THEME_DIR])
  }

  private setupWatcher(devDir: string, themeDir: string, componentsDir: string, buildThemeParams: BuildThemeParams): Promise<void> {
    const watchDir = path.join(devDir, '.watch')

    // Need to access chokidar as a default import so it can be mocked in tests
    // eslint-disable-next-line import/no-named-as-default-member
    const themeWatcher = chokidar.watch([themeDir, componentsDir], {
      ignoreInitial: true,
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true
    })

    themeWatcher.on('all', async () => {
      await this.buildTheme(watchDir, buildThemeParams)
      syncFiles(watchDir, devDir)
    })

    this.log('Watching for changes...')

    return new Promise((resolve) => {
      if (process.env.NODE_ENV === 'test') {
        themeWatcher.emit('all', 'change', themeDir)
        resolve()
      }
    })
  }
}
