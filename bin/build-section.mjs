#! /usr/bin/env node
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { env, exit } from 'node:process'
import { basename, extname } from 'path'
import {
  copyFileOrDie,
  copyFilesWithFilter,
  FILE_ENCODING_OPTION,
  getFolderFilesRecursively,
  mergeFileContents,
  readFileOrDie,
  writeFileOrDie
} from '../utils/FileUtils.mjs'
import createSection from '../Factory/SectionFactory.js'
import logger from '../utils/Logger.js'

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
      if (basename(sectionFile) === 'schema.json') section.schemaFile = sectionFile
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

// search for manual script file references in liquid code
const jsFilesIncludedManually = []
if (section.jsFiles.length > 0 || section.jsModules.length > 0) {
  let match
  const regex = /<script.*?src="(.*?)"/gmi

  while (match = regex.exec(liquidCode)) {
    jsFilesIncludedManually.push(basename(match[1]))
  }
}

// Process JavaScript files

if (section.jsFiles.length > 0) {
  logger.debug('Processing JavaScript files')
  logger.debug(`${section.jsFiles.length} JavaScript file${section.jsFiles.length > 1 ? 's' : ''} found`)

  // Copy manually referenced files as is, get left out files as a results
  const jsFilesToMerge = await copyFilesWithFilter(section.jsFiles, section.assetsBuildFolder, jsFilesIncludedManually)

  // Merge jsCode and write build package JS file
  if (jsFilesToMerge.length > 0) {
    // Consolidate JS Code
    const jsCode = await mergeFileContents(jsFilesToMerge)
    // Write Section JS asset file
    const buildJsFileBasename = section.name + '.js'
    await writeFileOrDie(`${section.assetsBuildFolder}/${buildJsFileBasename}`, jsCode)
    // Inject Section JS asset file reference to the liquid code
    liquidCode += `\n<script src="{{ '${buildJsFileBasename}' | asset_url }}" async></script>`
  }
} else {
  logger.debug(`No JavaScript files found for ${section.name}`)
}

// Process JavaScript Modules
if (section.jsModules.length > 0) {
  logger.debug('Processing JavaScript Modules')
  logger.debug(`${section.jsModules.length} JavaScript Module${section.jsModules.length > 1 ? 's' : ''} found`)

  // Copy all files manually
  for (const jsModule of section.jsModules) {
    await copyFileOrDie(jsModule, `${section.assetsBuildFolder}/${basename(jsModule)}`)
  }

  // Filter out files that are already included within the liquid code
  const jsModulesToInject = section.jsModules.filter((jsModule) => {!jsFilesIncludedManually.includes(basename(jsModule))})

  for (const jsModule of jsModulesToInject) {
    liquidCode += `\n<script type="module" src="{{ '${basename(jsModule)}' | asset_url }}" async></script>`
  }
} else {
  logger.debug(`No JavaScript Modules found for ${section.name}`)
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

  const cssFilesToMerge = await copyFilesWithFilter(section.cssFiles, section.assetsBuildFolder, linkTagsHref)

  // Merge excluded CSS files and write build package CSS file
  if (cssFilesToMerge.length > 0) {
    // Consolidate CSS Code
    const cssCode = await mergeFileContents(cssFilesToMerge)
    // Write Section CSS asset file
    const buildCssFileBasename = section.name + '.css'
    await writeFileOrDie(section.assetsBuildFolder + '/' + buildCssFileBasename, cssCode)
    // Inject Section CSS asset file reference to the liquid code
    liquidCode += `\n<script src="{{ '${buildCssFileBasename}' | asset_url }}" async></script>`
  }
} else {
  logger.debug(`No CSS files found for ${section.name}`)
}

// append section schema
logger.debug('Processing Schema file')
liquidCode += `\n{% schema %}\n${await readFileOrDie(section.schemaFile)}\n{% endschema %}`

// create section liquid file
logger.debug('Finalizing Liquid file')
const liquidBuildFile = section.buildFolder + '/' + section.name + '.liquid'
await writeFile(liquidBuildFile, liquidCode)

logger.info('Work Complete')
