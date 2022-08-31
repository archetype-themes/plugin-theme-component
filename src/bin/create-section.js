#! /usr/bin/env node
import logger from '../utils/Logger.js'
import { env } from 'node:process'
import FileUtils from '../utils/FileUtils.js'
import Section from '../models/Section.js'
import { access } from 'node:fs/promises'
import { constants } from 'node:fs'
import { exec } from 'node:child_process'
import NodeUtils from '../utils/NodeUtils.js'
import BinUtils from '../utils/BinUtils.js'
import ComponentUtils from '../utils/ComponentUtils.js'

// Make sure we are within a theme or collection architecture
let shopifyComponentType
try {
  shopifyComponentType = await BinUtils.getShopifyComponentType()
} catch (error) {
  BinUtils.exitWithError(error)
}

if (![BinUtils.THEME_SHOPIFY_COMPONENT_TYPE, BinUtils.COLLECTION_SHOPIFY_COMPONENT_TYPE].includes(shopifyComponentType)) {
  BinUtils.exitWithError(`INVALID SHOPIFY COMPONENT TYPE: "${shopifyComponentType}". This script can only be run from a "theme" or "collection" Shopify Component.`)
}

// Make sure we have a section name
const args = NodeUtils.getArgs()
if (args.length === 0) {
  BinUtils.exitWithError('Please specify a section name. ie: yarn create-section some-smart-section-name')
}

const section = new Section()
section.name = args[0].replace(/[^a-z0-9_-]/gi, '-')

logger.info(`Creating "${section.name}" Section`)

section.rootFolder = `${env.PROJECT_CWD}/sections/${section.name}`

// Exit if the folder already exists
try {
  await access(section.rootFolder, constants.X_OK)
  BinUtils.exitWithError('Section folder already exists. Please remove it or rename your section')
} catch (error) {
  // Error is expected, the folder shouldn't exist
}

// Create the folder structure
try {
  await ComponentUtils.createFolderStructure(section)
} catch (error) {
  BinUtils.exitWithError(error)
}

const defaultFiles = []

defaultFiles['/package.json'] = `{
  "author": "Archetype Themes LLC",
  "description": "Shopify Theme ${section.name} Section",
  "license": "UNLICENSED",
  "main": "src/${section.name}.liquid",
  "name": "${section.name}",
  "packageManager": "yarn@3.2.2",
  "version": "1.0.0",
   "config": {
    "shopifyComponentType": "section"
  },
  "devDependencies": {
    "@archetype-themes/archie": "portal:/Users/archetype/Projects/archetype-themes/archie",
    "standard": "^17.0.0"
  },
  "standard": {
    "ignore": [
      "build/**"
    ]
  }
}
`

defaultFiles['/README.md'] = `# Archie's ${section.name} Section
This section is intended to be bundled in a theme through the Archie monorepo.
`

// Section Liquid file
defaultFiles[`/src/${section.name}.liquid`] = ``

// Schema
defaultFiles['/src/schema.json'] = `{
  "name": "${section.name}",
  "tag": "section"
}
`

// Locales
defaultFiles['/src/locales/en-US.json'] = `{
  "sections": {
    "${section.name}": {
    }
  }
}
`

// Javascript
defaultFiles['/src/scripts/index.js'] = `// This is the javascript entrypoint for the ${section.name} section. 
// This file and all its inclusions will be processed through esbuild
`

// Styles
defaultFiles['/src/styles/main.scss'] = `// This is the stylesheet entrypoint for the ${section.name} section. 
// This file and all its inclusions will be processed through esbuild
`

// Write files to disk
for (const filename in defaultFiles) {
  await FileUtils.writeFile(`${section.rootFolder}${filename}`, defaultFiles[filename])
}

// Run yarn install; this must be done or yarn will send error messages relating to monorepo integrity
exec('yarn install', { cwd: section.rootFolder })