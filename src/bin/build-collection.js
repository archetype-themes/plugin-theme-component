#! /usr/bin/env node
import Config from '../Config.js'
import NodeUtils from '../utils/NodeUtils.js'
import { env } from 'node:process'
import CollectionBuilder from '../builders/CollectionBuilder.js'

// Make sure we are within a theme or collection architecture
let componentType
try {
  componentType = await Config.getComponentType()
} catch (error) {
  NodeUtils.exitWithError(error)
}

if (![Config.THEME_COMPONENT_TYPE, Config.COLLECTION_COMPONENT_TYPE].includes(componentType)) {
  NodeUtils.exitWithError(`INVALID COMPONENT TYPE: "${componentType}". This script can only be run from a "theme" or "collection" Component.`)
}

let collectionName

if (Config.THEME_COMPONENT_TYPE === componentType) {
  const args = NodeUtils.getArgs()
  if (!args[0]) {
    NodeUtils.exitWithError('Please specify a collection name. ie: yarn build-collection some-sagacious-collection-name')
  }
  collectionName = args[0]
} else if (componentType === Config.COLLECTION_COMPONENT_TYPE) {
  collectionName = env.npm_package_name
}

console.log('Collection Name', collectionName)

await CollectionBuilder.build(collectionName)
