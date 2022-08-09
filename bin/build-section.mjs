#! /usr/bin/env node
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { env, exit } from 'node:process'
import { basename } from 'path'
import FileUtils from '../utils/FileUtils.js'
import SectionFactory from '../factory/SectionFactory.js'
import logger from '../utils/Logger.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import SnippetFactory from '../factory/SnippetFactory.js'
import ComponentUtils from '../utils/ComponentUtils.js'

const section = await SectionFactory.createSection(env.npm_package_name)

logger.info(`Building "${section.name}" section`)

// Clean build folder
try {
  await rm(section.buildFolder, { force: true, recursive: true })
  await mkdir(section.assetsBuildFolder, { recursive: true })
} catch (error) {
  logger.error(error)
  exit(1)
}

// Abort if we have no liquid file
if (section.liquidFiles.length === 0) {
  logger.error('No liquid file found - aborting build')
  exit(1)
}

for (const render of section.renders) {
  const snippet = await SnippetFactory.fromRender(render)

  for (const snippetFile in section.snippetFiles) {

    if (snippetFile === snippet.name) {
      snippet.liquidFiles = [snippetFile]
      break
    }
  }
  if (snippet.liquidFiles.length === 0) {
    const snippetFiles = await FileUtils.getFolderFilesRecursively(snippet.rootFolder)
    ComponentUtils.filterFiles(snippetFiles, snippet)
  }

  render.snippet = snippet
}

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
  section.liquidCode += `\n{% schema %}\n${await FileUtils.readFileOrDie(section.schemaFile)}\n{% endschema %}`
}

// create section liquid file
logger.debug('Finalizing Liquid file')
const liquidBuildFile = section.buildFolder + '/' + section.name + '.liquid'
await writeFile(liquidBuildFile, section.liquidCode)

logger.info('Work Complete')
