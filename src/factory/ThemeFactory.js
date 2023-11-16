// Node Imports
import { join } from 'path'
import Session from '../models/static/Session.js'

// Internal Imports
import Theme from '../models/Theme.js'
import { getPackageManifest, getPackageName, getPackageRootFolder } from '../utils/NodeUtils.js'
import Components from '../config/Components.js'

class ThemeFactory {
  /**
   * From Build Script
   * @return {Theme}
   */
  static fromThemeInstallCommand () {
    const theme = new Theme()

    theme.name = getPackageName()
    // Set folder names
    if (Session.config.path) {
      theme.rootFolder = join(getPackageRootFolder(), Session.config.path)
    } else {
      theme.rootFolder = getPackageRootFolder()
    }

    return ThemeFactory.#setChildFolders(theme)
  }

  /**
   * Create Theme For A Dev Command Call
   * @param {string} themeRootFolder
   * @returns {Theme}
   */
  static async fromDevCommand (themeRootFolder) {
    const packageManifest = await getPackageManifest(themeRootFolder)
    const theme = new Theme()

    theme.rootFolder = themeRootFolder
    theme.name = getPackageName(packageManifest)

    return ThemeFactory.#setChildFolders(theme)
  }

  /**
   *  Set Theme's Child Folders
   * @param {Theme} theme
   * @returns {Theme}
   */
  static #setChildFolders (theme) {
    theme.assetsFolder = join(theme.rootFolder, Components.ASSETS_FOLDER_NAME)
    theme.configFolder = join(theme.rootFolder, Components.CONFIG_FOLDER_NAME)
    theme.localesFolder = join(theme.rootFolder, Components.LOCALES_FOLDER_NAME)
    theme.sectionsFolder = join(theme.rootFolder, Components.SECTIONS_FOLDER_NAME)
    theme.snippetsFolder = join(theme.rootFolder, Components.SNIPPETS_FOLDER_NAME)

    return theme
  }
}

export default ThemeFactory

export const fromDevCommand = ThemeFactory.fromDevCommand
export const fromThemeInstallCommand = ThemeFactory.fromThemeInstallCommand
