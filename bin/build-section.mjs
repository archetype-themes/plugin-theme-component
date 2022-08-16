#! /usr/bin/env node
import { mkdir, rm } from 'node:fs/promises'
import { env, exit } from 'node:process'
import SectionFactory from '../factory/SectionFactory.js'
import logger from '../utils/Logger.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import SectionBuilder from '../builders/SectionBuilder.js'

logger.info(`Building "${env.npm_package_name}" section`)

const section = await SectionFactory.fromName(env.npm_package_name)

// Clean build folder
await rm(section.build.rootFolder, { force: true, recursive: true })
await mkdir(section.build.rootFolder, { recursive: true })

if (section.files.localeFiles.length > 0) {
  await mkdir(section.build.localesFolder, { recursive: true })
}
if (section.files.snippetFiles.length > 0) {
  // TODO : Could be triggered only if we have a snippet with a "for" loop because we can't inline it
  await mkdir(section.build.snippetsFolder, { recursive: true })
}

// Abort if we have no liquidFiles file
if (section.files.liquidFiles.length === 0) {
  logger.error(`${section.name}: No liquidFiles file found - aborting build`)
  exit(1)
}

section.renders = LiquidUtils.findRenders(section.liquidCode)
logger.debug(`${section.name}: ${section.renders.length} render tag${section.renders.length > 1 ? 's' : ''} found`)

//  Fill renders with the proper snippet object
if (section.renders.length > 0) {
  await mkdir(section.build.snippetsFolder, { recursive: true })
  await SectionBuilder.buildSnippets(section)
} else {
  logger.debug(`${section.name}: No "Render" tags found`)
}

// Create build/assets folder if we have any assets
if (section.files.javascriptFiles.length > 0 || section.files.stylesheets.length > 0) {
  await mkdir(section.build.assetsFolder, { recursive: true })
}

// Process JavaScript files
if (section.files.javascriptIndex) {
  logger.debug(`${section.name}: Processing JavaScript`)
  await SectionBuilder.buildJavascript(section)
  logger.debug(`${section.name}: Javascript build complete`)
} else {
  logger.debug(`${section.name}: No external javaScript found`)
}

// Process CSS files
if (section.files.mainStylesheet) {
  logger.debug(`${section.name}: Processing CSS files`)

  await SectionBuilder.buildStylesheets(section)

  logger.debug(`${section.name}: CSS build complete`)
} else {
  logger.debug(`${section.name}: No external CSS`)
}

// Process Locale Files
if (section.files.localeFiles.length > 0) {
  await mkdir(section.build.localesFolder, { recursive: true })

  logger.debug(`${section.name}: ${section.files.localeFiles.length} Locale file${section.files.localeFiles.length > 1 ? 's' : ''} found`)
  logger.debug(`${section.name}: Processing Locale files`)

  SectionBuilder.buildLocales(section)

  logger.debug(`${section.name}: Locales build complete`)
} else {
  logger.debug(`${section.name}: No Locale files found`)
}

logger.debug(`${section.name}: Finalizing Liquid file`)
await SectionBuilder.buildLiquid(section)

logger.info(`${section.name}: Work Complete`)
