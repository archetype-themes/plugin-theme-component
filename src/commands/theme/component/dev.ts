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

import Args from '../../../utilities/args.js'    
import BaseCommand from '../../../utilities/base-command.js'
import { cleanDir, copyFileIfChanged, syncFiles } from '../../../utilities/files.js'
import Flags from '../../../utilities/flags.js'
import { cloneTheme } from '../../../utilities/git.js'
import { getCollectionNodes } from '../../../utilities/nodes.js'
import GenerateImportMap from '../generate/import-map.js'
import GenerateTemplateMap from '../generate/template-map.js'
import Install from './install.js'

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
    Flags.GENERATE_TEMPLATE_MAP
  ])

  protected override async init(): Promise<void> {
    await super.init(Dev)
  }

  public async run(): Promise<void> {
    const componentSelector = this.args[Args.COMPONENT_SELECTOR]
    const generateImportMap = this.flags[Flags.GENERATE_IMPORT_MAP]
    const generateTemplateMap = this.flags[Flags.GENERATE_TEMPLATE_MAP]
    const setupFiles = this.flags[Flags.SETUP_FILES]
    const preview = this.flags[Flags.PREVIEW]
    const watch = this.flags[Flags.WATCH]

    const collectionDir = process.cwd()
    const componentsDir = path.join(collectionDir, 'components')
    const devDir = path.join(process.cwd(), '.dev')

    // Remove the existing dev directory if it exists
    cleanDir(devDir)

    // Clone the theme if it's a remote repo and set the themeDir to the cloned repo
    let themeDir: string;
    if (this.flags[Flags.THEME_DIR].includes('github.com')) {
      themeDir = path.join(devDir, '.repo')
      this.log(`Cloning theme from ${this.flags[Flags.THEME_DIR]} into dev directory ${devDir}`)
      await cloneTheme(this.flags[Flags.THEME_DIR], themeDir)
    } else {
      themeDir = path.resolve(process.cwd(), this.flags[Flags.THEME_DIR])
    }

    this.log(`Building theme in ${devDir}...`)
    const buildTheme = async(destination: string) => {
      // Copy the theme files to the dev directory
      syncFiles(themeDir, destination);

      // Copy the component setup files to the dev directory based on the component selector
      if (setupFiles) {
        const collectionNodes = getCollectionNodes(collectionDir)
        for (const setupFile of collectionNodes
          .filter(node => componentSelector === '*' || componentSelector.includes(path.basename(node.file, '.liquid')))
          .flatMap(node => node.setup)) {
            const folderName = path.basename(path.dirname(setupFile))
            const name = path.basename(setupFile)
            const node = collectionNodes.find(n => n.name === name && n.themeFolder === folderName)
            if (node) {
              copyFileIfChanged(node.file, path.join(destination, node.themeFolder, node.name))
            }
          }
      }
      
      // Install the components
      await Install.run([destination])

      // Generate the js import map
      if (generateImportMap) {
        await GenerateImportMap.run([destination, '--quiet'])
      }

      // Generate the template map that is used by explorer
      if (generateTemplateMap && setupFiles) {
        await GenerateTemplateMap.run([destination, '--quiet'])
      }
    } 

    await buildTheme(devDir)

    // Run shopify theme dev on the dev directory
    if (preview) {
      await this.config.runCommand(`theme:dev`, ['--path', devDir])
    }

    // Watch for changes to the theme and components and rebuild the theme
    if (watch) {
      const watchDir = path.join(devDir, '.watch')
      const themeWatcher = chokidar.watch([themeDir, componentsDir], {
        ignoreInitial: true,
        ignored: /(^|[/\\])\../, // ignore dotfiles
        persistent: true
      })

      // Watch for specific file events
      themeWatcher.on('all', async () => {
        await buildTheme(watchDir)
        syncFiles(watchDir, devDir)
      })

      this.log('Watching for changes...')

      return new Promise((resolve) => {
        // Store the resolve function so it can be called externally if needed
        if (process.env.NODE_ENV === 'test') {
          // Simulate a change event
          themeWatcher.emit('all', 'change', themeDir)
          resolve()
        }
      })
    }
  }
}
