// Node Imports
import { join } from 'path'
import Session from '../models/static/Session.js'

// Internal Imports
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
    if (Session.config.path) {
      theme.rootFolder = join(NodeUtils.getPackageRootFolder(), Session.config.path)
    } else {
      theme.rootFolder = NodeUtils.getPackageRootFolder()
    }

    theme.assetsFolder = join(theme.rootFolder, Components.ASSETS_FOLDER_NAME)
    theme.configFolder = join(theme.rootFolder, Components.CONFIG_FOLDER_NAME)
    theme.localesFolder = join(theme.rootFolder, Components.LOCALES_FOLDER_NAME)
    theme.sectionsFolder = join(theme.rootFolder, Components.SECTIONS_FOLDER_NAME)
    theme.snippetsFolder = join(theme.rootFolder, Components.SNIPPETS_FOLDER_NAME)

    return theme
  }
}

export default ThemeFactory
