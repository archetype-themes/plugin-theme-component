// NodeJS internal imports
import { exec } from 'child_process'
import { env } from 'node:process'
import { access, constants } from 'node:fs/promises'
import path from 'path'
import util from 'util'
// Node Modules imports
import merge from 'deepmerge'
// Archie imports
import ArchieComponents from '../config/ArchieComponents.js'
import Snippet from '../models/Snippet.js'
import SnippetFiles from '../models/SnippetFiles.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'
import NodeUtils from '../utils/NodeUtils.js'

const execPromise = util.promisify(exec)

class SnippetGenerator {
  /**
   * Generate Snippet
   * @param {string} snippetName
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async generate (snippetName) {
    const collectionName = NodeUtils.getPackageName()
    const promises = []
    const snippet = new Snippet()

    // Initialize Snippet
    snippet.name = snippetName
    snippet.rootFolder = path.join(env.PROJECT_CWD, ArchieComponents.COLLECTION_SNIPPETS_SUB_FOLDER, snippet.name)
    snippet.files = new SnippetFiles()
    snippet.files.packageJson = path.join(snippet.rootFolder, 'package.json')

    logger.info(`Creating ${snippet.name} Snippet`)

    // Exit if the folder already exists
    let folderExists = false
    try {
      // This will throw an error if the folder doesn't exist.
      await access(snippet.rootFolder, constants.X_OK)
      // This only run if the previous "access" call was successful, proving the folder already exists
      folderExists = true
    } catch {
      // An error is expected, the folder shouldn't exist
    }

    // Don't overwrite an existing snippet, throw an error
    if (folderExists) {
      throw new Error(`The "${snippet.name}" snippet folder already exists. Please remove it or choose a different name.`)
    }

    // Create the folder structure
    await ComponentUtils.createFolderStructure(snippet)

    // Initialize the repository
    await execPromise('yarn init', { cwd: snippet.rootFolder })
    await execPromise('yarn config set nodeLinker node-modules', { cwd: snippet.rootFolder })
    await execPromise('yarn add standard --dev', { cwd: snippet.rootFolder })

    // Load package.json and add to it.
    const packageJsonDefaults = this.getPackageJsonDefaults(collectionName, snippet.name)

    const packageJson = JSON.parse(await FileUtils.getFileContents(snippet.files.packageJson))

    const mergedPackageJson = merge(packageJson, packageJsonDefaults)

    promises.push(FileUtils.writeFile(snippet.files.packageJson, JSON.stringify(mergedPackageJson)))

    const defaultFiles = this.getDefaultFiles(collectionName, snippet.name)

    // Write files to disk
    for (const filename in defaultFiles) {
      promises.push(FileUtils.writeFile(`${snippet.rootFolder}${filename}`, defaultFiles[filename]))
    }

    // Run yarn install; this must be done or yarn will send error messages relating to monorepo integrity
    promises.push(execPromise('yarn install', { cwd: snippet.rootFolder }))

    return Promise.all(promises)
  }

  /**
   * Get Default Files
   * @param {string} collectionName
   * @param {string} snippetName
   * @return {string[]}
   */
  static getDefaultFiles (collectionName, snippetName) {
    const defaultFiles = []

    defaultFiles['/README.md'] = `# ${snippetName} Snippet
The ${snippetName} Snippet is part of the ${collectionName} Collection. To add this snippet to a Section of the same 
Collection, simply require its main liquid file without a path and Archie will take care of the rest on build.
`

    // Snippet Liquid file
    defaultFiles[`/src/${snippetName}.liquid`] = ``

    // Schema
    defaultFiles['/src/schema.json'] = `{

}
`

    // Locales
    defaultFiles['/src/locales/locales.json'] = `{
  "en": {
    "snippet_name": "${snippetName}"
  },
  "es": {
    "snippet_name": "${snippetName}"
  },
  "fr": {
    "snippet_name": "${snippetName}"
  }
}
`

    defaultFiles['/src/locales/locales.schema.json'] = `{
  "en": {
    "snippet_name": "${snippetName}"
  },
  "es": {
    "snippet_name": "${snippetName}"
  },
  "fr": {
    "snippet_name": "${snippetName}"
  }
}
`

    // Javascript
    defaultFiles['/src/scripts/index.js'] = `// This is the javascript entrypoint for the ${snippetName} snippet. 
// This file and all its inclusions will be processed through esbuild
`

    // Styles
    defaultFiles['/src/styles/main.scss'] = `// This is the stylesheet entrypoint for the ${snippetName} snippet. 
// This file and all its inclusions will be processed through esbuild
`

    return defaultFiles
  }

  static getPackageJsonDefaults (collectionName, snippetName) {
    return {
      author: 'Archetype Themes Limited Partnership',
      description: `${collectionName}'s ${snippetName} Snippet`,
      license: 'UNLICENSED',
      main: `src/${snippetName}.liquid`,
      name: `${snippetName}`,
      version: '1.0.0',
      archie: {
        componentType: 'snippet'
      },
      standard: {
        ignore: [
          'build/**'
        ]
      }
    }

  }
}

export default SnippetGenerator
