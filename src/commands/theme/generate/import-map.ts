import * as fs from 'fs'
import * as path from 'path'
import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'

export default class GenerateImportMap extends BaseCommand {
  static description = 'Generate an import map for JavaScript files in the assets directory'

  static override args = Args.getDefinitions([
    Args.override(Args.THEME_DIR, { required: false, default: '.' })
  ])

  async run() {
    const themeDir = path.resolve(process.cwd(), this.args[Args.THEME_DIR])
    const assetsDir = path.join(themeDir, 'assets')
    const snippetsDir = path.join(themeDir, 'snippets')
    
    // Check if assets directory exists
    if (!fs.existsSync(assetsDir)) {
      this.error(`Assets directory not found. Please ensure ${themeDir} is a theme directory.`)
    }
    // Create snippets directory if it doesn't exist
    if (!fs.existsSync(snippetsDir)) {
      this.error(`Snippets directory not found. Please ensure ${themeDir} is a theme directory.`)
    }

    // Get all JS files in assets directory
    const jsFiles = fs.readdirSync(assetsDir)
      .filter(file => file.endsWith('.js'))

    // Create import map object
    const importMap = {
      imports: Object.fromEntries(
        jsFiles.map(file => [
          // Use filename without .js extension as the key
          path.basename(file, '.js'),
          // Use Shopify's asset_url filter for the value
          `{{ '${file}' | asset_url }}`
        ])
      )
    }

    // Write the import map to snippets/import-map.liquid
    const importMapContent = `<script type="importmap">\n${JSON.stringify(importMap, null, 2)}\n</script>`
    const importMapPath = path.join(snippetsDir, 'import-map.liquid')
    if (!fs.existsSync(importMapPath) || fs.readFileSync(importMapPath, 'utf8') !== importMapContent) {
      fs.writeFileSync(importMapPath, importMapContent)
    }

    this.log('Successfully generated import map at snippets/import-map.liquid')
  }
}
