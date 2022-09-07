#! /usr/bin/env node
import SectionBuilder from '../builders/SectionBuilder.js'
import NodeUtils from '../utils/NodeUtils.js'
import Config from '../Config.js'
import { env } from 'node:process'

// Make sure we are within a theme or collection architecture
let componentType
try {
  componentType = await Config.getComponentType()
} catch (error) {
  NodeUtils.exitWithError(error)
}

if (componentType === Config.SNIPPET_COMPONENT_TYPE) {
  NodeUtils.exitWithError(`INVALID COMPONENT TYPE: "${componentType}". This script can only be run from a "theme", "collection" or "section" Component.`)
}

let sectionName

if ([Config.COLLECTION_COMPONENT_TYPE, Config.THEME_COMPONENT_TYPE].includes(componentType)) {
  const args = NodeUtils.getArgs()
  if (!args[0]) {
    NodeUtils.exitWithError('Please specify a section name. ie: yarn build-section some-smart-section-name')
  }
  sectionName = args[0]
} else if (componentType === Config.SECTION_COMPONENT_TYPE) {
  sectionName = env.npm_package_name
}

await SectionBuilder.build(sectionName)
