import chokidar from 'chokidar'
import fs from 'node:fs'
import {copyComponents, copyTheme} from '../../../utilities/theme-files.js'    
import Flags from '../../../utilities/flags.js'
import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import config from '../../../utilities/config.js'

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
    Flags.THEME_CLI_CONFIG,
    Flags.COLLECTION_COMPONENT_DIR,
    Flags.COLLECTION_NAME,
    Flags.COLLECTION_DEV_DIR,
    Flags.COLLECTION_DEV_THEME_DIR,
    Flags.COPY_SETUP_FILES,
    Flags.WATCH,
    Flags.SYNC,
  ])

  public async run(): Promise<void> {
    // Remove existing dev directory
    if (fs.existsSync(config.COLLECTION_DEV_DIR!)) {
      fs.rmSync(config.COLLECTION_DEV_DIR!, {recursive: true})
    }
    
    // Copy theme files into dev directory
    await copyTheme(config.COLLECTION_DEV_THEME_DIR!, config.COLLECTION_DEV_DIR!)

    // Copy component files into dev directory
    await copyComponents(this.args[Args.COMPONENT_SELECTOR], config.COLLECTION_DEV_DIR!)

    if (config.WATCH) {
      // Watch theme source directory for changes
      const themeWatcher = chokidar.watch(config.COLLECTION_DEV_THEME_DIR!)
      
      themeWatcher.on('all', async (event: string, path: string) => {
        if (event === 'add' || event === 'change' || event === 'unlink') {
          await copyTheme(config.COLLECTION_DEV_THEME_DIR!, config.COLLECTION_DEV_DIR!)
          // After theme files are copied, ensure components are up to date
          await copyComponents(this.args[Args.COMPONENT_SELECTOR], config.COLLECTION_DEV_DIR!)
        }
      })

      // Watch component directory for changes
      const componentWatcher = chokidar.watch(config.COLLECTION_COMPONENT_DIR)
      
      componentWatcher.on('all', async (event: string, path: string) => {
        if (event === 'add' || event === 'change') {
          await copyComponents(this.args[Args.COMPONENT_SELECTOR], config.COLLECTION_DEV_DIR!)
        }
      })

      return new Promise(() => {})
    }
  }
}


