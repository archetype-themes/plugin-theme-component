import { join } from 'node:path'
import { BUILD_FOLDER_NAME } from '../config/CLI.js'
import CollectionBuild from '../models/CollectionBuild.js'
import Components from '../config/Components.js'
import { hyphenate } from '@shopify/cli-kit/common/string'

class BuildFactory {
  /**
   * Create Collection Build
   * @param {module:models/Collection} collection Collection Model Instance
   * @returns {CollectionBuild}
   */
  static fromCollection (collection) {
    const build = new CollectionBuild()
    // Root Folder
    build.rootFolder = join(collection.rootFolder, BUILD_FOLDER_NAME)
    // Sub-Folders
    build.assetsFolder = join(build.rootFolder, Components.ASSETS_FOLDER_NAME)
    build.configFolder = join(build.rootFolder, Components.CONFIG_FOLDER_NAME)
    build.localesFolder = join(build.rootFolder, Components.LOCALES_FOLDER_NAME)
    build.sectionsFolder = join(build.rootFolder, Components.SECTIONS_FOLDER_NAME)
    build.snippetsFolder = join(build.rootFolder, Components.SNIPPETS_FOLDER_NAME)
    // Files
    build.importMapFile = join(build.snippetsFolder, Components.IMPORT_MAP_SNIPPET_FILENAME)
    build.javascriptFile = join(build.assetsFolder, `${collection.name}.js`)
    build.stylesheet = join(build.assetsFolder, `${hyphenate(collection.name)}.css`)

    return build
  }
}

export default BuildFactory
