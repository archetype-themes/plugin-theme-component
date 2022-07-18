#! /usr/bin/env node
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { env, exit } from 'node:process'
import { basename, extname } from 'path'
import { getFolderFilesRecursively, copyFilesInList } from '../utils/FileUtils.mjs'
import createSection from '../Factory/SectionFactory.js'

const section = createSection(env.npm_package_name)

console.log(`\nBuilding "${section.name}" section\n`)

// Package components
// Clean build folder
try {
  await rm(section.buildFolder, { force: true, recursive: true })
  await mkdir(section.assetsBuildFolder, { recursive: true })
} catch (error) {
  console.error(error)
  exit(1)
}

// Scan package folder
let sectionFiles
try {
  sectionFiles = await getFolderFilesRecursively(section.rootFolder)
} catch (error) {
  console.error(error)
  exit(1)
}

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
      if (basename(sectionFile) === 'schema.json') section.settingsFile = sectionFile
      break
    default:
      console.warn('Ignoring ' + sectionFile)
      break
  }
}

// Abort if we have no liquid file
if (section.liquidFiles.length === 0) {
  console.error('ERR: No liquid file found - aborting build')
  exit(1)
}

// Collate liquid content from all liquid files with the default folder/alphabetical order
let liquidCode = ''

for (const liquidFile of section.liquidFiles) {
  liquidCode += await readFile(liquidFile, { encoding: 'UTF-8' })
}

// Process javascript files
if (section.jsFiles.length > 0) {

  // search for script file references
  const scriptTagsSrc = []
  let match

  const regex = /<script.*?src="(.*?)"/gmi

  while (match = regex.exec(liquidCode)) {
    scriptTagsSrc.push(basename(match[1]))
  }

  let excludedFiles
  try {
    excludedFiles = await copyFilesInList(section.jsFiles, section.assetsBuildFolder, scriptTagsSrc)
  } catch (err) {
    console.error(err.message)
    exit(1)
  }

  // Merge jsCode and write build package JS file
  if (excludedFiles.length > 0) {
    let jsCode = ''

    for (const jsFileToProcess of excludedFiles) {
      try {
        jsCode += await readFile(jsFileToProcess, { encoding: 'UTF-8' })
      } catch (err) {
        console.error('DOH ' + err.message)
        exit(1)
      }
    }
    const buildJsFileBasename = section.name + '.js'
    try {
      await writeFile(section.assetsBuildFolder + '/' + buildJsFileBasename, jsCode)
    } catch (err) {
      console.error(err.message)
      exit(1)
    }
    liquidCode += `\n<script src="{{ '${buildJsFileBasename}' | asset_url }}" async></script>`
  }
}

// Process CSS files
if (section.cssFiles.length > 0) {

  // search for script file references
  const linkTagsHref = []
  let match

  const regex = /<link.*?href="(.*?)"/gmi

  while (match = regex.exec(liquidCode)) {
    linkTagsHref.push(basename(match[1]))
  }

  const excludedFiles = await copyFilesInList(section.cssFiles, section.assetsBuildFolder, linkTagsHref)

  // Merge excluded js files and write build package JS file
  if (excludedFiles.length > 0) {
    let jsCode = ''

    for (const cssFileToProcess of excludedFiles) {
      jsCode += await readFile(cssFileToProcess, { encoding: 'UTF-8' })
    }
    const buildCssFileBasename = section.name + '.css'
    await writeFile(section.assetsBuildFolder + '/' + buildCssFileBasename, jsCode)
    liquidCode += `\n<script src="{{ '${buildCssFileBasename}' | asset_url }}" async></script>`
  }
}

// append section json

// create section liquid file
const liquidBuildFile = section.buildFolder + '/' + section.name + '.liquid'
await writeFile(liquidBuildFile, liquidCode)

console.log(section)
console.log('\nTHE END\n')
