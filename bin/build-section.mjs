#! /usr/bin/env node
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { cwd, env, exit } from 'node:process'
import { basename, extname } from 'path'
import { getFolderFilesRecursively, copyFilesInList } from '../utils/FileUtils.mjs'

// Constants
const packageName = env.npm_package_name

console.log(`\nBuilding "${packageName}" section\n`)

// Determine package root folder name
let packageFolder
if (env.npm_config_local_prefixw)
  packageFolder = env.npm_config_local_prefix
else {
  packageFolder = cwd()

  if (packageFolder.includes(packageName)) {
    packageFolder = packageFolder.substring(0, packageFolder.lastIndexOf(packageName) + packageName.length)
  } else {
    packageFolder = cwd()
  }
}

const buildFolder = packageFolder + '/build'
const assetsBuildFolder = buildFolder + '/assets'

// Package Files containers
const jsFiles = []
const jsModules = []
const cssFiles = []
const liquidFiles = []
let settingsFile = null

// Clean build folder
try {
  await rm(buildFolder, { force: true, recursive: true })
  await mkdir(assetsBuildFolder, { recursive: true })

} catch (err) {
  console.error(err)
  exit(1)
}

// Scan package folder
let packageFiles
try {
  packageFiles = await getFolderFilesRecursively(packageFolder)
} catch (err) {
  console.error(err)
  exit(1)
}

// Categorize found files for the build steps
for (const packageFile of packageFiles) {
  const extension = extname(packageFile)

  switch (extension) {
    case '.css':
      cssFiles.push(packageFile)
      break
    case '.js':
      jsFiles.push(packageFile)
      break
    case '.mjs':
      jsModules.push(packageFile)
      break
    case '.liquid':
      liquidFiles.push(packageFile)
      break
    case '.json':
      if (basename(packageFile) === 'schema.json')
        settingsFile = packageFile
      break
    default:
      console.warn('Ignoring ' + packageFile)
      break
  }
}

// Abort if we have no liquid file
if (liquidFiles.length === 0) {
  console.error('ERR: No liquid file found - aborting build')
  exit(1)
}

// Collate liquid content from all liquid files with the default folder/alphabetical order
let liquidCode = ''

for (const liquidFile of liquidFiles) {
  liquidCode += await readFile(liquidFile, { encoding: 'UTF-8' })
}

// TODO: Filter out liquid comments & HTML comments from liquidCode -> it could break the next regex for search or <script> src attribute if a commented out <script> tag is taken into account

// Process javascript files
if (jsFiles.length > 0) {

  // search for script file references
  const scriptTagsSrc = []
  let match
  // TODO: avoid searching in HTML comments (see previous TODO item)
  const regex = /<script.*?src="(.*?)"/gmi

  while (match = regex.exec(liquidCode)) {
    scriptTagsSrc.push(basename(match[1]))
  }

  let excludedFiles
  try {
    excludedFiles = await copyFilesInList(jsFiles, assetsBuildFolder, scriptTagsSrc)
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
    const buildJsFileBasename = packageName + '.js'
    try {
      await writeFile(assetsBuildFolder + '/' + buildJsFileBasename, jsCode)
    } catch (err) {
      console.error(err.message)
      exit(1)
    }
    liquidCode += `\n<script src="{{ '${buildJsFileBasename}' | asset_url }}" async></script>`
  }
}

// Process javascript files
if (cssFiles.length > 0) {

  // search for script file references
  const linkTagsHref = []
  let match
  // TODO: avoid searching in HTML comments (see previous TODO item)
  const regex = /<link.*?href="(.*?)"/gmi

  while (match = regex.exec(liquidCode)) {
    linkTagsHref.push(basename(match[1]))
  }

  const excludedFiles = await copyFilesInList(cssFiles, assetsBuildFolder, linkTagsHref)

  // Merge excluded js files and write build package JS file
  if (excludedFiles.length > 0) {
    let jsCode = ''

    for (const jsFileToProcess of excludedFiles) {
      jsCode += await readFile(jsFileToProcess, { encoding: 'UTF-8' })
    }
    const buildJsFileBasename = packageName + '.js'
    await writeFile(assetsBuildFolder + '/' + buildJsFileBasename, jsCode)
    liquidCode += `\n<script src="{{ '${buildJsFileBasename}' | asset_url }}" async></script>`
  }
}

// append section json



// create section liquid file
const liquidBuildFile = buildFolder + '/' + packageName + '.liquid'
await writeFile(liquidBuildFile, liquidCode)

console.log('\nTHE END\n')
