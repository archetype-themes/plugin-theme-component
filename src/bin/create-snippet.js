#! /usr/bin/env node
import logger from '../utils/Logger.js'
import { env } from 'node:process'
import FileUtils from '../utils/FileUtils.js'
import { access } from 'node:fs/promises'
import { constants } from 'node:fs'
import Snippet from '../models/Snippet.js'
import { exec } from 'child_process'
import Config from '../Config.js'
import NodeUtils from '../utils/NodeUtils.js'
import ComponentUtils from '../utils/ComponentUtils.js'

// Make sure we are within a theme or collection architecture
let componentType
try {
  componentType = await Config.getComponentType()
} catch (error) {
  NodeUtils.exitWithError(error)
}

if (![Config.THEME_COMPONENT_TYPE, Config.COLLECTION_COMPONENT_TYPE].includes(componentType)) {
  NodeUtils.exitWithError(`INVALID COMPONENT TYPE: "${componentType}". This script can only be run from a "theme" or "collection" Component.`)
}

// Make sure we have a snippet name
const args = NodeUtils.getArgs()
if (args.length === 0) {
  NodeUtils.exitWithError('Please specify a snippet name. ie: yarn create-snippet some-smart-snippet-name')
}

const snippet = new Snippet()
snippet.name = args[0].replace(/[^a-z0-9_-]/gi, '-')

logger.info(`Creating ${snippet.name} Snippet`)

snippet.rootFolder = `${env.PROJECT_CWD}/snippets/${snippet.name}`

// Exit if the folder already exists
try {
  await access(snippet.rootFolder, constants.X_OK)
  NodeUtils.exitWithError('Snippet folder already exists. Please remove it or rename your snippet')
} catch (error) {
  // Error is expected, the folder shouldn't exist
}

// Create the folder structure
try {
  await ComponentUtils.createFolderStructure(snippet)
} catch (error) {
  NodeUtils.exitWithError(error)
}

const defaultFiles = []

defaultFiles['/package.json'] = `{
  "author": "Archetype Themes Limited Partnership",
  "description": "Shopify Themes ${snippet.name} Snippet",
  "license": "UNLICENSED",
  "main": "src/${snippet.name}.liquid",
  "name": "${snippet.name}",
  "packageManager": "yarn@3.2.2",
  "version": "1.0.0",
  "archie": {
    "componentType": "snippet"
  },
  "devDependencies": {
    "standard": "^17.0.0"
  },
  "standard": {
    "ignore": [
      "build/**"
    ]
  }
}
`

defaultFiles['/README.md'] = `# Archie's ${snippet.name} Snippet
This snippet is intended to be bundled in a theme through the Archie monorepo.
`

// Snippet Liquid file
defaultFiles[`/src/${snippet.name}.liquid`] = ``

// Schema
defaultFiles['/src/schema.json'] = `{

}
`

// Locales
defaultFiles['/src/locales/en-US.json'] = `{
  "snippets": {
    "${snippet.name}": {
    }
  }
}
`

// Javascript
defaultFiles['/src/scripts/index.js'] = `// This is the javascript entrypoint for the ${snippet.name} snippet. 
// This file and all its inclusions will be processed through esbuild
`

// Styles
defaultFiles['/src/styles/main.scss'] = `// This is the stylesheet entrypoint for the ${snippet.name} snippet. 
// This file and all its inclusions will be processed through esbuild
`

// Write files to disk
for (const filename in defaultFiles) {
  await FileUtils.writeFile(`${snippet.rootFolder}${filename}`, defaultFiles[filename])
}

// Run yarn install; this must be done or yarn will send error messages relating to monorepo integrity
exec('yarn install', { cwd: snippet.rootFolder })
