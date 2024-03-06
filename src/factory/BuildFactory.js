import { join } from 'node:path'
import { BUILD_FOLDER_NAME } from '../config/CLI.js'
import CollectionBuild from '../models/CollectionBuild.js'
import {
  ASSETS_FOLDER_NAME,
  CONFIG_FOLDER_NAME,
  IMPORT_MAP_SNIPPET_FILENAME,
  LOCALES_FOLDER_NAME,
  SECTIONS_FOLDER_NAME,
  SNIPPETS_FOLDER_NAME
} from '../config/Components.js'
import { hyphenate } from '@shopify/cli-kit/common/string'

class BuildFactory {
  /**
   * Create Collection Build
   * @param {module:models/Collection} collection Collection Model Instance
   * @returns {CollectionBuild}
   */
  static fromCollection(collection) {
    const build = new CollectionBuild()
    // Root Folder
    build.rootFolder = join(collection.rootFolder, BUILD_FOLDER_NAME)
    // Sub-Folders
    build.assetsFolder = join(build.rootFolder, ASSETS_FOLDER_NAME)
    build.configFolder = join(build.rootFolder, CONFIG_FOLDER_NAME)
    build.localesFolder = join(build.rootFolder, LOCALES_FOLDER_NAME)
    build.sectionsFolder = join(build.rootFolder, SECTIONS_FOLDER_NAME)
    build.snippetsFolder = join(build.rootFolder, SNIPPETS_FOLDER_NAME)
    // Files
    build.importMapFile = join(
      build.snippetsFolder,
      IMPORT_MAP_SNIPPET_FILENAME
    )
    build.javascriptFile = join(build.assetsFolder, `${collection.name}.js`)
    build.stylesheet = join(
      build.assetsFolder,
      `${hyphenate(collection.name)}.css`
    )

    return build
  }
}

export default BuildFactory
