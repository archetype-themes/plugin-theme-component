#! /usr/bin/env node
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { env, exit } from 'node:process'
import { basename, extname } from 'path'
import {
  copyFileOrDie,
  copyFiles,
  FILE_ENCODING_OPTION,
  getFolderFilesRecursively,
  mergeFileContents,
  readFileOrDie,
  writeFileOrDie
} from '../utils/FileUtils.mjs'
import createSection from '../factory/SectionFactory.js'
import logger from '../utils/Logger.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.mjs'
import { getScriptFiles } from '../utils/HtmlUtils.js'

const section = createSection(env.npm_package_name)

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
const sectionFiles = await getFolderFilesRecursively(section.rootFolder)

// Categorize files for the build steps
for (const sectionFile of sectionFiles) {
  const extension = extname(sectionFile)

  switch (extension) {
    case '.css':
      section.cssFiles.push(sectionFile)
      break
    case '.js':
      section.jsFiles.push(sectionFile)
      break
    case '.mjs':
      section.jsModules.push(sectionFile)
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
      logger.debug(`Ignoring ${sectionFile}`)
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

// Create build/assets folder if we have any assets
if (section.jsFiles.length > 0 || section.jsModules.length > 0 || section.cssFiles.length > 0) {
  await mkdir(section.assetsBuildFolder, { recursive: true })
}

// Process JavaScript files
if (section.jsFiles.length > 0 || section.jsModules.length > 0) {
  logger.debug('Processing JavaScript')

  const javaScriptProcessor = new JavaScriptProcessor()
  await javaScriptProcessor.loadDefaultOptions()
  const jsFilesFullPathInLiquid = getScriptFiles(liquidCode)
  const jsFilesInLiquid = jsFilesFullPathInLiquid.map(file => basename(file))

  // Process JavaScript Files
  if (section.jsFiles.length > 0) {
    logger.debug(`Processing ${section.jsFiles.length} JavaScript file${section.jsFiles.length > 1 ? 's' : ''}`)
    const buildJsFileBasename = section.name + '.js'
    const jsFiles = await javaScriptProcessor.processJsFiles(section.jsFiles, buildJsFileBasename, jsFilesInLiquid)
    // Write JS files to disk
    for (const filename in jsFiles) {
      await writeFileOrDie(`${section.assetsBuildFolder}/${filename}`, jsFiles[filename])
      if (!jsFilesInLiquid.includes(filename)) {
        liquidCode += `\n<script src="{{ '${filename}' | asset_url }}" async></script>`
      }
    }
  }
  // Process JavaScript Modules
  if (section.jsModules.length > 0) {
    logger.debug(`Processing ${section.jsModules.length} JavaScript module${section.jsFiles.length > 1 ? 's' : ''}`)
    const jsModules = await javaScriptProcessor.processJsModules(section.jsModules)

    for (const filename in jsModules) {
      await writeFileOrDie(`${section.assetsBuildFolder}/${filename}`, jsModules[filename])
      if (!jsFilesInLiquid.includes(filename)) {
        liquidCode += `\n<script type="module" src="{{ '${filename}' | asset_url }}" async></script>`
      }

    }
  }
} else {
  logger.debug(`No JavaScript files found for ${section.name}`)
}

// Process CSS files
if (section.cssFiles.length > 0) {
  logger.debug('Processing CSS files')
  logger.debug(`${section.cssFiles.length} CSS file${section.cssFiles.length > 1 ? 's' : ''} found`)

  // search for manually referenced CSS files in the liquid code
  const linkTagsHref = []
  let match
  const regex = /<link.*?href="(.*?)"/gmi

  while (match = regex.exec(liquidCode)) {
    linkTagsHref.push(basename(match[1]))
  }

  const cssFilesToMerge = await copyFiles(section.cssFiles, section.assetsBuildFolder, linkTagsHref)

  // Merge excluded CSS files and write build package CSS file
  if (cssFilesToMerge.length > 0) {
    // Consolidate CSS Code
    const cssCode = await mergeFileContents(cssFilesToMerge)
    // Write Section CSS asset file
    const buildCssFileBasename = section.name + '.css'
    await writeFileOrDie(section.assetsBuildFolder + '/' + buildCssFileBasename, cssCode)
    // Inject Section CSS asset file reference to the liquid code
    liquidCode += `\n{{ '${buildCssFileBasename}' | global_asset_url | stylesheet_tag }}`
  }
} else {
  logger.debug(`No CSS files found for ${section.name}`)
}

// Process Locale Files
if (section.localeFiles.length > 0) {
  await mkdir(section.localesBuildFolder, { recursive: true })
  logger.debug('Processing Locale files')
  logger.debug(`${section.localeFiles.length} Locale file${section.localeFiles.length > 1 ? 's' : ''} found`)

  section.localeFiles.forEach(file => copyFileOrDie(file, `${section.localesBuildFolder}/${basename(file)}`))

} else {
  logger.debug(`No Locale files found for ${section.name}`)
}

// append section schema
if (section.schemaFile) {
  logger.debug('Processing Schema file')
  liquidCode += `\n{% schema %}\n${await readFileOrDie(section.schemaFile)}\n{% endschema %}`
}

// create section liquid file
logger.debug('Finalizing Liquid file')
const liquidBuildFile = section.buildFolder + '/' + section.name + '.liquid'
await writeFile(liquidBuildFile, liquidCode)

logger.info('Work Complete')
