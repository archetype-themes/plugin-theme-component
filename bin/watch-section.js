#! /usr/bin/env node
import { env } from 'node:process'
import { watch } from 'node:fs/promises'
import SectionFactory from '../factory/SectionFactory.js'
import logger from '../utils/Logger.js'
import SectionBuilder from '../builders/SectionBuilder.js'

const section = await buildIt()

try {
  const watcher = watch(section.rootFolder + '/src', { recursive: true })
  for await (const event of watcher) {
    if (!event.filename.endsWith('~')) {
      logger.debug(`Detected a "${event.eventType}" event on "${event.filename}"`)
      await buildIt()
    }
  }

} catch (err) {
  //if (err.name === 'AbortError')
  //return
  throw err
}

async function buildIt () {
  logger.info(`Building "${env.npm_package_name}" section`)
  console.time(`Building "${env.npm_package_name}" section`)
  const section = await SectionFactory.fromName(env.npm_package_name)
  await SectionBuilder.build(section)
  logger.info(`${section.name}: Work Complete`)
  console.timeEnd(`Building "${env.npm_package_name}" section`)
  console.log('\n')
  return section
}
