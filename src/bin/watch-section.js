#!/usr/bin/env node
import { env } from 'node:process'
import SectionBuilder from '../builders/SectionBuilder.js'
import Config from '../models/static/Config.js'
import NodeUtils from '../utils/NodeUtils.js'
import SectionWatcher from '../watchers/SectionWatcher.js'
import SectionFactory from '../factory/SectionFactory.js'
import Archie from '../models/static/Archie.js'
import ConfigUtils from '../utils/ConfigUtils.js'

//Init Config
try {
  await ConfigUtils.initConfig()
} catch (error) {

  NodeUtils.exitWithError(error)
}

// Make sure we are within a theme or collection architecture
if (Config.isSnippet() || Config.isTheme()) {
  NodeUtils.exitWithError(`INVALID COMPONENT TYPE: "${Config.componentType}". This script can only be run from a "collection" or "section" Component.`)
}

let sectionName

if (Config.isCollection()) {
  const args = NodeUtils.getArgs()
  if (!args[0]) {
    NodeUtils.exitWithError('Please specify a section name. ie: yarn build-section some-smart-section-name')
  }
  sectionName = args[0]
} else if (Config.isSection()) {
  sectionName = env.npm_package_name.includes('/') ? env.npm_package_name.split('/')[1] : env.npm_package_name
}

const section = await SectionFactory.fromName(Archie.targetComponent)
await SectionBuilder.build(section)

await SectionWatcher.watch(section)
