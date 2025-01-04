/**
 * This command sets up a sandboxed development environment for components.
 * 
 * - Removes any existing development directory
 * - Copies dev theme files and rendered component files into a temporary development directory
 * - Watches for changes to synchronize updates
 * - Runs 'shopify theme dev' on the temporary development directory to preview your work
 */


import chokidar from 'chokidar'
import fs from 'node:fs'
import path from 'node:path'

import Args from '../../../utilities/args.js'    
import BaseCommand from '../../../utilities/base-command.js'
import config from '../../../utilities/config.js'
import Flags from '../../../utilities/flags.js'
import {copyComponents, copyTheme} from '../../../utilities/theme-files.js'

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
    Flags.GENERATE_IMPORT_MAP,
    Flags.GENERATE_TEMPLATE_MAP
  ])

  protected override async init(): Promise<void> {
    await super.init(Dev)
  }

  public async run(): Promise<void> {
    if (fs.existsSync(config.COLLECTION_DEV_DIR!)) {
      this.log(`Removing existing dev directory: ${config.COLLECTION_DEV_DIR}`)
      fs.rmSync(config.COLLECTION_DEV_DIR!, {recursive: true})
    }
    
    this.log(`Copying theme files from ${config.COLLECTION_DEV_THEME_DIR} into dev directory ${config.COLLECTION_DEV_DIR}`)
    await copyTheme(config.COLLECTION_DEV_THEME_DIR!, config.COLLECTION_DEV_DIR!)

    this.log(`Copying component files from ${config.COLLECTION_COMPONENT_DIR} into dev directory ${config.COLLECTION_DEV_DIR}`)
    await copyComponents(this.args[Args.COMPONENT_SELECTOR], config.COLLECTION_DEV_DIR!)

    if (this.flags[Flags.GENERATE_IMPORT_MAP]) {
      await this.config.runCommand(`theme:generate:import-map`, [config.COLLECTION_DEV_DIR!])
    }

    if (this.flags[Flags.GENERATE_TEMPLATE_MAP] && this.flags[Flags.COPY_SETUP_FILES]) {
      await this.config.runCommand(`theme:generate:template-map`, [config.COLLECTION_DEV_DIR!])
    }

    if (config.SYNC) {
      this.log(`Running 'shopify theme dev' on path ${config.COLLECTION_DEV_DIR}`)
      await this.config.runCommand(`theme:dev`, ['--path', config.COLLECTION_DEV_DIR!])
    }

    if (config.WATCH) {
      this.log(`Watching theme and component directories for changes...`)

      const themeWatcher = chokidar.watch(config.COLLECTION_DEV_THEME_DIR!,{
        // ignored: (file) => file.startsWith('.'),
        ignoreInitial: true,
      })
      themeWatcher.on('all', async (event: string, filePath: string) => {
        if (event === 'add' || event === 'change') {
          this.debug(`Theme file ${filePath} changed. Updating theme files to dev directory.`)
          await copyTheme(config.COLLECTION_DEV_THEME_DIR!, config.COLLECTION_DEV_DIR!)
          await copyComponents(this.args[Args.COMPONENT_SELECTOR], config.COLLECTION_DEV_DIR!)
        } else if (event === 'unlink') {
          this.debug(`Theme file ${filePath} removed. Removing from dev directory.`)
          const relativePath = path.relative(config.COLLECTION_DEV_THEME_DIR!, filePath)
          const destinationPath = path.join(config.COLLECTION_DEV_DIR!, relativePath)
          if (fs.existsSync(destinationPath)) {
            fs.rmSync(destinationPath)
          }
        }
      })

      const componentWatcher = chokidar.watch(config.COLLECTION_COMPONENT_DIR, {
        ignored: (file) => file.endsWith('.md'),
        ignoreInitial: true
      })
      componentWatcher.on('all', async (event: string, filePath: string) => {
        if (event === 'add' || event === 'change') {
          this.debug(`Component file ${filePath} changed. Updating component files to dev directory.`)
          await copyComponents(this.args[Args.COMPONENT_SELECTOR], config.COLLECTION_DEV_DIR!)
        } else if (event === 'unlink') {
          this.debug(`Component file ${filePath} removed. Removing from dev directory.`)
          const relativePath = path.relative(config.COLLECTION_COMPONENT_DIR, filePath)
          const destinationPath = path.join(config.COLLECTION_DEV_DIR!, relativePath)
          if (fs.existsSync(destinationPath)) {
            fs.rmSync(destinationPath)
          }
        }
      })

      return new Promise(() => {})
    }
  }
}


