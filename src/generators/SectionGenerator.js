// NodeJS internal imports
import { exec } from 'child_process'
import { env } from 'node:process'
import { access, constants } from 'node:fs/promises'
import path from 'path'
import util from 'util'
// Node Modules imports
import merge from 'deepmerge'
// Archie imports
import Section from '../models/Section.js'
import SectionFiles from '../models/SectionFiles.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'
import NodeUtils from '../utils/NodeUtils.js'
import ComponentsConfig from '../config/ComponentsConfig.js'

const execPromise = util.promisify(exec)

class SectionGenerator {
  /**
   * Generate Section
   * @param {string} sectionName
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async generate (sectionName) {
    const collectionName = NodeUtils.getPackageName()
    const promises = []
    const section = new Section()

    // Initialize sections
    section.name = sectionName
    section.rootFolder = path.join(env.PROJECT_CWD, ComponentsConfig.COLLECTION_SECTIONS_SUB_FOLDER, section.name)
    section.files = new SectionFiles()
    section.files.packageJson = path.join(section.rootFolder, 'package.json')

    logger.info(`Creating "${section.name}" Section`)

    // Exit if the folder already exists
    let folderExists = false
    try {
      // This will throw an error if the folder doesn't exist.
      await access(section.rootFolder, constants.X_OK)
      // This only run if the previous "access" call was successful, proving the folder already exists
      folderExists = true
    } catch {
      // An error is expected since the folder shouldn't exist
    }

    // Don't overwrite an existing section, throw an error
    if (folderExists) {
      throw new Error(`The "${section.name}" section folder already exists. Please remove it or choose a different name.`)
    }

    // Create the folder structure
    await ComponentUtils.createFolderStructure(section)

    // Initialize the repository
    await execPromise('yarn init', { cwd: section.rootFolder })
    await execPromise('yarn config set nodeLinker node-modules', { cwd: section.rootFolder })
    await execPromise('yarn add @archetype-themes/archie@archetype-themes/archie --dev', { cwd: section.rootFolder })
    await execPromise('yarn add standard --dev', { cwd: section.rootFolder })

    // Load package.json and add to it.
    const packageJsonDefaults = this.getPackageJsonDefaults(collectionName, section.name)

    const packageJson = JSON.parse(await FileUtils.getFileContents(section.files.packageJson))

    const mergedPackageJson = merge(packageJson, packageJsonDefaults)

    promises.push(FileUtils.writeFile(section.files.packageJson, JSON.stringify(mergedPackageJson)))

    const defaultFiles = this.getDefaultFiles(collectionName, section.name)

    // Write files to disk
    for (const filename in defaultFiles) {
      promises.push(FileUtils.writeFile(`${section.rootFolder}${filename}`, defaultFiles[filename]))
    }

    // Run yarn install; this must be done or yarn will send error messages relating to monorepo integrity
    promises.push(execPromise('yarn install', { cwd: section.rootFolder }))

    return Promise.all(promises)
  }

  /**
   * Get Default Files
   * @param {string} collectionName
   * @param {string} sectionName
   * @return {string[]}
   */
  static getDefaultFiles (collectionName, sectionName) {

    const defaultFiles = []

    defaultFiles['/README.md'] = `# ${sectionName} Section
The ${sectionName} Section is part of the ${collectionName} Collection. To add this section to your theme, install the 
${collectionName} Collection as a node dependency first. Configure your Theme according to the [Archie
 documentation](https://github.com/archetype-themes/archie/blob/main/README.md) for more details.
`

    // Section Liquid file
    defaultFiles[`/src/${sectionName}.liquid`] = ``

    // Schema
    defaultFiles['/src/schema.json'] = `{
  "name": "${sectionName}",
  "tag": "section"
}
`

    // Locales
    defaultFiles['/src/locales/locales.json'] = `{
  "en": {
    "section_name": "${sectionName}"
  },
  "es": {
    "section_name": "${sectionName}"
  },
  "fr": {
    "section_name": "${sectionName}"
  }
}
`

    defaultFiles['/src/locales/locales.schema.json'] = `{
  "en": {
    "section_name": "${sectionName}"
  },
  "es": {
    "section_name": "${sectionName}"
  },
  "fr": {
    "section_name": "${sectionName}"
  }
}
`

    // Javascript
    defaultFiles['/src/scripts/index.js'] = `// This is the javascript entrypoint for the ${sectionName} section. 
// This file and all its inclusions will be processed through esbuild
`

    // Styles
    defaultFiles['/src/styles/main.scss'] = `// This is the stylesheet entrypoint for the ${sectionName} section. 
// This file and all its inclusions will be processed through esbuild
`

    return defaultFiles
  }

  static getPackageJsonDefaults (collectionName, sectionName) {
    return {
      author: 'Archetype Themes Limited Partnership',
      description: `${collectionName}'s ${sectionName} Section`,
      license: 'UNLICENSED',
      main: `src/${sectionName}.liquid`,
      name: `${sectionName}`,
      version: '1.0.0',
      archie: {
        componentType: 'section'
      },
      standard: {
        ignore: [
          'build/**'
        ]
      }
    }

  }

}

export default SectionGenerator
