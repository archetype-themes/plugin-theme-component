#! /usr/bin/env node
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { env, exit } from 'node:process'
import { basename, extname } from 'path'
import FileUtils, { FILE_ENCODING_OPTION } from '../utils/FileUtils.js'
import SectionFactory from '../factory/SectionFactory.js'
import logger from '../utils/Logger.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'

const section = SectionFactory.createSection(env.npm_package_name)

logger.info(`Building "${section.name}" section`)

// Package components
// Clean build folder
try {
  await rm(section.buildFolder, { force: true, recursive: true })
  await mkdir(section.assetsBuildFolder, { recursive: true })
} catch (error) {
  logger.error(error)
  exit(1)
}

// Scan package folder
const sectionFiles = await FileUtils.getFolderFilesRecursively(section.rootFolder)

// Categorize files for the build steps
for (const sectionFile of sectionFiles) {
  const extension = extname(sectionFile)

  switch (extension) {
    case '.css':
    case '.less':
    case '.sass':
    case '.scss':
      section.styleSheets.push(sectionFile)
      break
    case '.js':
    case '.mjs':
      section.jsFiles.push(sectionFile)
      break
    case '.liquid':
      section.liquidFiles.push(sectionFile)
      break
    case '.json':
      if (basename(sectionFile) === 'schema.json')
        section.schemaFile = sectionFile
      else if (basename(sectionFile).match(/^([a-z]{2})(-[a-z]{2})?(\.(default|schema)){0,2}\.json$/i))
        section.localeFiles.push(sectionFile)
      break
    default:
      logger.debug(`Ignoring ${FileUtils.convertToComponentRelativePath(sectionFile)}`)
      break
  }
}

// Abort if we have no liquid file
if (section.liquidFiles.length === 0) {
  logger.error('No liquid file found - aborting build')
  exit(1)
}

// Collate liquid content from all liquid files with the default folder/alphabetical order
let liquidCode = ''

logger.debug(`${section.liquidFiles.length} liquid file${section.liquidFiles.length > 1 ? 's' : ''} found`)
for (const liquidFile of section.liquidFiles) {
  liquidCode += `\n${await readFile(liquidFile, FILE_ENCODING_OPTION)}`
}

const renders = LiquidUtils.findRenders(liquidCode)
console.log(renders)

// Create build/assets folder if we have any assets
if (section.jsFiles.length > 0 || section.styleSheets.length > 0) {
  await mkdir(section.assetsBuildFolder, { recursive: true })
}

// Process JavaScript files
if (section.jsFiles.length > 0) {
  logger.debug('Processing JavaScript')

  try {
    const mainJavaScriptFile = JavaScriptProcessor.getMainJavascriptFile(section.jsFiles)
    await JavaScriptProcessor.buildJavaScript(`${section.assetsBuildFolder}/${section.name}.js`, mainJavaScriptFile)
  } catch (error) {
    logger.error(error)
    exit(1)
  }
} else {
  logger.debug(`No JavaScript files found for ${section.name}`)
}

// Process CSS files
if (section.styleSheets.length > 0) {
  logger.debug('Processing CSS files')
  logger.debug(`${section.styleSheets.length} CSS file${section.styleSheets.length > 1 ? 's' : ''} found`)

  try {
    const mainStyleSheet = StylesProcessor.getMainStyleSheet(section.styleSheets)
    await StylesProcessor.buildStyles(`${section.assetsBuildFolder}/${section.name}.css`, mainStyleSheet)
  } catch (error) {
    logger.error(error)
    exit(1)
  }

} else {
  logger.debug(`No CSS files found for ${section.name}`)
}

// Process Locale Files
if (section.localeFiles.length > 0) {
  await mkdir(section.localesBuildFolder, { recursive: true })
  logger.debug('Processing Locale files')
  logger.debug(`${section.localeFiles.length} Locale file${section.localeFiles.length > 1 ? 's' : ''} found`)

  section.localeFiles.forEach(file => FileUtils.copyFileOrDie(file, `${section.localesBuildFolder}/${basename(file)}`))

} else {
  logger.debug(`No Locale files found for ${section.name}`)
}

// append section schema
if (section.schemaFile) {
  logger.debug('Processing Schema file')
  liquidCode += `\n{% schema %}\n${await FileUtils.readFileOrDie(section.schemaFile)}\n{% endschema %}`
}

// create section liquid file
logger.debug('Finalizing Liquid file')
const liquidBuildFile = section.buildFolder + '/' + section.name + '.liquid'
await writeFile(liquidBuildFile, liquidCode)

logger.info('Work Complete')
