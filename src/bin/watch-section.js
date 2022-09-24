#!/usr/bin/env node
import { env, exit } from 'node:process'
import { watch } from 'node:fs/promises'
import logger from '../utils/Logger.js'
import SectionBuilder from '../builders/SectionBuilder.js'
import Config from '../models/static/Config.js'
import NodeUtils from '../utils/NodeUtils.js'

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

const section = await SectionBuilder.build(sectionName)

async function watchSection () {
  try {
    const watcher = watch(section.rootFolder + '/src', { recursive: true })
    for await (const event of watcher) {
      if (!event.filename.endsWith('~')) {
        logger.debug(`Detected a "${event.eventType}" event on "${event.filename}"`)
        await SectionBuilder.build(sectionName)
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      logger.debug('Received Abort Signal - Exiting')
      logger.info('See you again soon!')
      exit(0)
    } else {
      await watchSection()
    }
  }
}

await watchSection()
