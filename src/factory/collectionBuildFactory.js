import { join } from 'node:path'
import { BUILD_FOLDER_NAME } from '../config/CLI.js'
import CollectionBuild from '../models/CollectionBuild.js'
import { IMPORT_MAP_SNIPPET_FILENAME } from '../config/Components.js'
import { hyphenate } from '@shopify/cli-kit/common/string'

/**
 * Create Collection Build
 * @param {module:models/Collection} collection Collection Model Instance
 * @returns {CollectionBuild}
 */
export function collectionBuildFactory(collection) {
  const build = new CollectionBuild()
  // Root Folder
  build.rootFolder = join(collection.rootFolder, BUILD_FOLDER_NAME)
  build.snippetsFolder = join(build.rootFolder, SNIPPETS_FOLDER_NAME)
  // Files
  build.importMapFile = join(build.snippetsFolder, IMPORT_MAP_SNIPPET_FILENAME)
  build.stylesheet = `${hyphenate(collection.name)}.css`

  return build
}
