import CollectionBuild from '../models/CollectionBuild.js'
import { hyphenate } from '@shopify/cli-kit/common/string'

/**
 * Create Collection Build
 * @param {module:models/Collection} collection Collection Model Instance
 * @returns {CollectionBuild}
 */
export function collectionBuildFactory(collection) {
  const build = new CollectionBuild()
  // Files
  build.stylesheet = `${hyphenate(collection.name)}.css`

  return build
}
