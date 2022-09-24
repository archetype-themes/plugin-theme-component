import Section from '../models/Section.js'
import logger from '../utils/Logger.js'
import path from 'path'
import { env } from 'node:process'
import Config from '../models/static/Config.js'
import { access } from 'node:fs/promises'
import { constants } from 'node:fs'
import NodeUtils from '../utils/NodeUtils.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import FileUtils from '../utils/FileUtils.js'
import { exec } from 'node:child_process'

class SectionGenerator {
  /**
   * Generate Section
   * @param sectionName
   * @return {Promise<void>}
   */
  static async generate (sectionName) {
    const section = new Section()
    section.name = sectionName

    logger.info(`Creating "${section.name}" Section`)

    section.rootFolder = path.join(env.PROJECT_CWD, Config.COLLECTION_SECTIONS_SUBFOLDER, section.name)

    // Exit if the folder already exists
    try {
      await access(section.rootFolder, constants.X_OK)
      NodeUtils.exitWithError('Section folder already exists. Please remove it or rename your section')
    } catch (error) {
      // Error is expected, the folder shouldn't exist
    }

    // Create the folder structure
    try {
      await ComponentUtils.createFolderStructure(section)
    } catch (error) {
      NodeUtils.exitWithError(error)
    }

    const collectionName = env.npm_package_name.includes('/') ? env.npm_package_name.split('/')[1] : env.npm_package_name

    const defaultFiles = []

    defaultFiles['/package.json'] = `{
  "author": "Archetype Themes Limited Partnership",
  "description": "${collectionName}'s ${section.name} Section",
  "license": "UNLICENSED",
  "main": "src/${section.name}.liquid",
  "name": "${Config.PACKAGES_SCOPE}/${section.name}",
  "packageManager": "yarn@${Config.YARN_VERSION}",
  "version": "1.0.0",
  "archie": {
    "componentType": "section"
  },
  "devDependencies": {
    "@archetype-themes/archie": "github:archetype-themes/archie",
    "standard": "^17.0.0"
  },
  "standard": {
    "ignore": [
      "build/**"
    ]
  }
}
`

    defaultFiles['/README.md'] = `# ${collectionName}'s ${section.name} Section
This section is intended to be bundled in a theme through an Archetype components' collection monorepo
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
    defaultFiles['/src/locales/locales.json'] = `{
  "en": {
    "section_name": "${section.name}"
  },
  "es": {
    "section_name": "${section.name}"
  },
  "fr": {
    "section_name": "${section.name}"
  }
}
`

    defaultFiles['/src/locales/locales.schema.json'] = `{
  "en": {
    "section_name": "${section.name}"
  },
  "es": {
    "section_name": "${section.name}"
  },
  "fr": {
    "section_name": "${section.name}"
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
  }
}

export default SectionGenerator
