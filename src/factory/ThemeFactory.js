// External Dependencies
import { join } from 'path'
import { cwd } from 'node:process'

// Internal Dependencies
import {
  ASSETS_FOLDER_NAME,
  CONFIG_FOLDER_NAME,
  LOCALES_FOLDER_NAME,
  SECTIONS_FOLDER_NAME,
  SNIPPETS_FOLDER_NAME
} from '../config/Components.js'
import Theme from '../models/Theme.js'
import { getCurrentWorkingDirectoryName } from '../utils/NodeUtils.js'

class ThemeFactory {
  /**
   * From Build Script
   * @return {Theme}
   */
  static fromThemeInstallCommand () {
    const theme = new Theme()

    theme.name = getCurrentWorkingDirectoryName()
    theme.rootFolder = cwd()

    return ThemeFactory.#setChildFolders(theme)
  }

  /**
   * Create Theme For A Dev Command Call
   * @param {string} themeRootFolder
   * @returns {Promise<Theme>}
   */
  static async fromDevCommand (themeRootFolder) {
    const theme = new Theme()

    theme.rootFolder = themeRootFolder

    return ThemeFactory.#setChildFolders(theme)
  }

  /**
   *  Set Theme's Child Folders
   * @param {Theme} theme
   * @returns {Theme}
   */
  static #setChildFolders (theme) {
    theme.assetsFolder = join(theme.rootFolder, ASSETS_FOLDER_NAME)
    theme.configFolder = join(theme.rootFolder, CONFIG_FOLDER_NAME)
    theme.localesFolder = join(theme.rootFolder, LOCALES_FOLDER_NAME)
    theme.sectionsFolder = join(theme.rootFolder, SECTIONS_FOLDER_NAME)
    theme.snippetsFolder = join(theme.rootFolder, SNIPPETS_FOLDER_NAME)

    return theme
  }
}

export default ThemeFactory

export const fromDevCommand = ThemeFactory.fromDevCommand
