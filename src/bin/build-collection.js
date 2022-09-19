#!/usr/bin/env node
import Config from '../Config.js'
import NodeUtils from '../utils/NodeUtils.js'
import CollectionBuilder from '../builders/CollectionBuilder.js'
import ConfigUtils from '../utils/ConfigUtils.js'
import CollectionFactory from '../factory/CollectionFactory.js'

//Init Config
try {
  await ConfigUtils.initConfig()
} catch (error) {
  NodeUtils.exitWithError(error)
}

// Make sure we are within a collection architecture
if (!Config.isCollection()) {
  NodeUtils.exitWithError(`INVALID COMPONENT TYPE: "${Config.componentType}". This script can only be run from a "collection" Component.`)
}

const collection = await CollectionFactory.fromBuildScript()

await CollectionBuilder.build(collection)
