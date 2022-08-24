#! /usr/bin/env node
import logger from '../utils/Logger.js'
import { env, exit } from 'node:process'
import FileUtils from '../utils/FileUtils.js'
import Section from '../models/Section.js'
import { access, mkdir } from 'node:fs/promises'
import { constants } from 'node:fs'
import { exec } from 'node:child_process'

const args = process.argv.slice(2)

if (!env.PROJECT_CWD) {
  logger.error(`Environment variable "PROJECT_CWD" is not available. Please prefix this command with yarn. ie: "yarn create-section".`)
  exit(1)
}
const packageJson = JSON.parse(await FileUtils.getFileContents(`${env.PROJECT_CWD}/package.json`))

if (packageJson.name !== 'archie') {
  logger.error(`Package name "${packageJson.name}" detected.This script is intended for use within the "archie" monorepo.`)
  exit(1)
}

if (!args[0] || args[0].match(/^--(verbose|quiet|debug)$/i)) {
  logger.error('Please specify a section name. ie: yarn create-section some-smart-section-name')
  exit(1)
}

const section = new Section()
section.name = args[0].replace(/[^a-z0-9_-]/gi, '-')

logger.info(`Creating ${section.name} Section`)

section.rootFolder = `${env.PROJECT_CWD}/sections/${section.name}`

try {
  await access(section.rootFolder, constants.X_OK)
  logger.error('Section folder already exists. Please remove it or rename your section')
  exit(1)
} catch (error) {

}

await mkdir(`${section.rootFolder}`, { recursive: true })
const defaultPackageJson = `{
  "author": "Archetype Themes LLC",
  "description": "Shopify Theme ${section.name} Section",
  "license": "UNLICENSED",
  "main": "src/${section.name}.liquid",
  "name": "${section.name}-section",
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

const defaultREADME = `# Archie's ${section.name} Section
This section is intended to be bundled in a theme through the Archie monorepo.
`
await FileUtils.writeFile(`${section.rootFolder}/package.json`, defaultPackageJson)
await FileUtils.writeFile(`${section.rootFolder}/README.md`, defaultREADME)

// Section Liquid file
await mkdir(`${section.rootFolder}/src`, { recursive: true })
await FileUtils.writeFile(`${section.rootFolder}/src/${section.name}.liquid`, '')

// Schema
const defaultSchema = `{
  "name": "${section.name}",
  "tag": "section",
}
`
await FileUtils.writeFile(`${section.rootFolder}/src/schema.json`, defaultSchema)

// Locales
const defaultLocaleFile = `{
  "sections": {
    "${section.name}": {
    }
  }
}
`
await mkdir(`${section.rootFolder}/src/locales`, { recursive: true })
await FileUtils.writeFile(`${section.rootFolder}/src/locales/en-US.json`, defaultLocaleFile)

// Javascript
const defaultJavascript = `// This is the javascript entrypoint for the ${section.name} section. 
// This file and all its inclusions will be processed through esbuild
`
await mkdir(`${section.rootFolder}/src/scripts`, { recursive: true })
await FileUtils.writeFile(`${section.rootFolder}/src/scripts/index.js`, defaultJavascript)

// Styles
const defaultStyles = `// This is the stylesheet entrypoint for the ${section.name} section. 
// This file and all its inclusions will be processed through esbuild
`
await mkdir(`${section.rootFolder}/src/styles`, { recursive: true })
await FileUtils.writeFile(`${section.rootFolder}/src/styles/main.scss`, defaultStyles)

// Embedded Snippets
await mkdir(`${section.rootFolder}/src/snippets`, { recursive: true })

exec('yarn install', { cwd: section.rootFolder })
