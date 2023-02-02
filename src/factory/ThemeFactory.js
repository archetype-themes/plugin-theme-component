//Node Imports
import { env } from 'node:process'
import { dirname, join } from 'path'

//Archie Imports
import Theme from '../models/Theme.js'
import NodeUtils from '../utils/NodeUtils.js'
import Components from '../config/Components.js'

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
    theme.assetsFolder = join(theme.rootFolder, Components.THEME_ASSETS_FOLDER)
    theme.localesFolder = join(theme.rootFolder, Components.THEME_LOCALES_FOLDER)
    theme.sectionsFolder = join(theme.rootFolder, Components.THEME_SECTIONS_FOLDER)
    theme.snippetsFolder = join(theme.rootFolder, Components.THEME_SNIPPETS_FOLDER)

    return theme
  }
}

export default ThemeFactory
