//Node Imports
import { env } from 'node:process'
import { dirname, join } from 'path'

//Archie Imports
import ArchieComponents from '../config/ArchieComponents.js'
import Theme from '../models/Theme.js'
import NodeUtils from '../utils/NodeUtils.js'

class ThemeFactory {
  /**
   * From Build Script
   * @return {Promise<Theme>}
   */
  static async fromInstallCommand () {

    const theme = new Theme()

    theme.name = NodeUtils.getPackageName()
    // Set folder names
    theme.rootFolder = join(dirname(env.npm_package_json), 'src')
    theme.assetsFolder = join(theme.rootFolder, ArchieComponents.COLLECTION_ASSETS_SUB_FOLDER)
    theme.sectionsFolder = join(theme.rootFolder, ArchieComponents.COLLECTION_SECTIONS_SUB_FOLDER)
    theme.snippetsFolder = join(theme.rootFolder, ArchieComponents.COLLECTION_SECTIONS_SUB_FOLDER)

    // Prepare build object
    // theme.build = BuildFactory.fromCollection(theme)

    return theme
  }
}

export default ThemeFactory
