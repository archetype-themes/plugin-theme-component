#! /usr/bin/env node
import logger from '../utils/Logger.js'
import { env, exit } from 'node:process'
import FileUtils from '../utils/FileUtils.js'
import { access, mkdir } from 'node:fs/promises'
import { constants } from 'node:fs'
import Snippet from '../models/Snippet.js'
import { exec } from 'child_process'

const args = process.argv.slice(2)

if (!env.PROJECT_CWD) {
  logger.error(`Environment variable "PROJECT_CWD" is not available. Please prefix this command with yarn. ie: "yarn create-snippet".`)
  exit(1)
}

const packageJson = JSON.parse(await FileUtils.getFileContents(`${env.PROJECT_CWD}/package.json`))

if (packageJson.name !== 'archie') {
  logger.error(`Package name "${packageJson.name}" detected.This script is intended for use within the "archie" monorepo.`)
  exit(1)
}

if (!args[0] || args[0].match(/^--(verbose|quiet|debug)$/i)) {
  logger.error('Please specify a snippet name. ie: yarn create-snippet some-smart-snippet-name')
  exit(1)
}

const snippet = new Snippet()
snippet.name = args[0].replace(/[^a-z0-9_-]/gi, '-')

logger.info(`Creating ${snippet.name} Snippet`)

snippet.rootFolder = `${env.PROJECT_CWD}/snippets/${snippet.name}`

try {
  await access(snippet.rootFolder, constants.X_OK)
  logger.error('Snippet folder already exists. Please remove it or rename your snippet')
  exit(1)
} catch (error) {

}

await mkdir(`${snippet.rootFolder}`, { recursive: true })
const defaultPackageJson = `{
  "author": "Archetype Themes LLC",
  "description": "Shopify Theme ${snippet.name} Snippet",
  "license": "UNLICENSED",
  "main": "src/${snippet.name}.liquid",
  "name": "${snippet.name}-snippet",
  "packageManager": "yarn@3.2.2",
  "version": "1.0.0",
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

const defaultREADME = `# Archie's ${snippet.name} Snippet
This snippet is intended to be bundled in a theme through the Archie monorepo.
`
await FileUtils.writeFile(`${snippet.rootFolder}/package.json`, defaultPackageJson)
await FileUtils.writeFile(`${snippet.rootFolder}/README.md`, defaultREADME)

// Snippet Liquid file
await mkdir(`${snippet.rootFolder}/src`, { recursive: true })
await FileUtils.writeFile(`${snippet.rootFolder}/src/${snippet.name}.liquid`, '')

// Schema
const defaultSchema = `{

}
`
await FileUtils.writeFile(`${snippet.rootFolder}/src/schema.json`, defaultSchema)

// Locales
const defaultLocaleFile = `{
  "snippets": {
    "${snippet.name}": {
    }
  }
}
`
await mkdir(`${snippet.rootFolder}/src/locales`, { recursive: true })
await FileUtils.writeFile(`${snippet.rootFolder}/src/locales/en-US.json`, defaultLocaleFile)

// Javascript
const defaultJavascript = `// This is the javascript entrypoint for the ${snippet.name} snippet. 
// This file and all its inclusions will be processed through esbuild
`
await mkdir(`${snippet.rootFolder}/src/scripts`, { recursive: true })
await FileUtils.writeFile(`${snippet.rootFolder}/src/scripts/index.js`, defaultJavascript)

// Styles
const defaultStyles = `// This is the stylesheet entrypoint for the ${snippet.name} snippet. 
// This file and all its inclusions will be processed through esbuild
`
await mkdir(`${snippet.rootFolder}/src/styles`, { recursive: true })
await FileUtils.writeFile(`${snippet.rootFolder}/src/styles/main.scss`, defaultStyles)

// Embedded Snippets
await mkdir(`${snippet.rootFolder}/src/snippets`, { recursive: true })

exec('yarn install', { cwd: snippet.rootFolder })
