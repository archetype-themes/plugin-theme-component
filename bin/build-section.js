#! /usr/bin/env node
import { env } from 'node:process'
import SectionFactory from '../factory/SectionFactory.js'
import logger from '../utils/Logger.js'
import SectionBuilder from '../builders/SectionBuilder.js'

logger.info(`Building "${env.npm_package_name}" section`)
console.time('build-section')

const section = await SectionFactory.fromName(env.npm_package_name)
await SectionBuilder.build(section)

logger.info(`${section.name}: Work Complete`)
console.timeEnd('build-section')
