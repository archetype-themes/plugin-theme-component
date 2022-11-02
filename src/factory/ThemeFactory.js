//Node Imports
import { env } from 'node:process'
import { dirname, join } from 'path'

//Archie Imports
import Theme from '../models/Theme.js'
import NodeUtils from '../utils/NodeUtils.js'

class ThemeFactory {
  /**
   * From Build Script
   * @return {Theme}
   */
  static fromThemeInstallCommand () {

    const theme = new Theme()

    theme.name = NodeUtils.getPackageName()
    // Set folder names
    theme.rootFolder = join(dirname(env.npm_package_json), 'src')
    theme.assetsFolder = join(theme.rootFolder, Theme.ASSETS_SUB_FOLDER)
    theme.sectionsFolder = join(theme.rootFolder, Theme.SECTIONS_SUB_FOLDER)
    theme.snippetsFolder = join(theme.rootFolder, Theme.SNIPPETS_SUB_FOLDER)

    return theme
  }
}

export default ThemeFactory
