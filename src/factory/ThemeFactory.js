import ThemeUtils from '../utils/ThemeUtils.js'
import Theme from '../models/Theme.js'
import { env } from 'node:process'
import { dirname, join } from 'path'
import Config from '../models/static/Config.js'

class ThemeFactory {
  /**
   * From Build Script
   * @return {Promise<Theme>}
   */
  static async fromArchieCall () {

    const theme = new Theme()

    theme.name = env.npm_package_name.includes('/') ? env.npm_package_name.split('/')[1] : env.npm_package_name
    // Set folder names
    theme.rootFolder = join(dirname(env.npm_package_json), 'src')
    theme.assetsFolder = join(theme.rootFolder, Config.COLLECTION_ASSETS_SUBFOLDER)
    theme.sectionsFolder = join(theme.rootFolder, Config.COLLECTION_SECTIONS_SUBFOLDER)
    theme.snippetsFolder = join(theme.rootFolder, Config.COLLECTION_SECTIONS_SUBFOLDER)

    // Prepare build object
    // theme.build = BuildFactory.fromCollection(theme)

    // Fetch Section Names
    theme.sectionNames = await ThemeUtils.findSectionNames(theme)

    return theme
  }
}

export default ThemeFactory
