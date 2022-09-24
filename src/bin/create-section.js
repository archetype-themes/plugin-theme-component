#!/usr/bin/env node
// Archie Config & Components
import Config from '../models/static/Config.js'
// Archie Utils
import ConfigUtils from '../utils/ConfigUtils.js'
import NodeUtils from '../utils/NodeUtils.js'
import SectionGenerator from '../generators/SectionGenerator.js'

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

// Make sure we have a section name
const args = NodeUtils.getArgs()
if (args.length === 0) {
  NodeUtils.exitWithError('Please specify a section name. ie: yarn create-section some-smart-section-name')
}

const sectionName = args[0].replace(/[^a-z0-9_-]/gi, '-')
await SectionGenerator.generate(sectionName)
