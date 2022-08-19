#! /usr/bin/env node
import { env, exit } from 'node:process'
import { watch } from 'node:fs/promises'
import logger from '../utils/Logger.js'
import SectionBuilder from '../builders/SectionBuilder.js'

const section = await SectionBuilder.build(env.npm_package_name)

async function watchSection () {
  try {
    const watcher = watch(section.rootFolder + '/src', { recursive: true })
    for await (const event of watcher) {
      if (!event.filename.endsWith('~')) {
        logger.debug(`Detected a "${event.eventType}" event on "${event.filename}"`)
        await SectionBuilder.build(env.npm_package_name)
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
