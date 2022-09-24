#!/usr/bin/env node
// Archie Config & Components
import Config from '../models/static/Config.js'
// Archie Utils
import ConfigUtils from '../utils/ConfigUtils.js'
import NodeUtils from '../utils/NodeUtils.js'
import snippetGenerator from '../generators/SnippetGenerator'

//Init Config
try {
  await ConfigUtils.initConfig()
} catch (error) {
  NodeUtils.exitWithError(error)
}

// Make sure we are within a collection targetComponent
if (!Config.isCollection()) {
  NodeUtils.exitWithError(`INVALID COMPONENT TYPE: "${Config.componentType}". This script can only be run from a "collection" Component.`)
}

// Make sure we have a snippet name
const args = NodeUtils.getArgs()
if (args.length === 0) {
  NodeUtils.exitWithError('Please specify a snippet name. ie: yarn create-snippet some-smart-snippet-name')
}

const snippetName = args[0].replace(/[^a-z0-9_-]/gi, '-')
await snippetGenerator.generate(snippetName)
