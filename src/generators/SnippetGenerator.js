import Snippet from '../models/Snippet.js'
import logger from '../utils/Logger.js'
import path from 'path'
import { env } from 'node:process'
import Config from '../models/static/Config.js'
import { access } from 'node:fs/promises'
import { constants } from 'node:fs'
import NodeUtils from '../utils/NodeUtils.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import FileUtils from '../utils/FileUtils.js'
import { exec } from 'child_process'

class SnippetGenerator {
  /**
   * Generate Snippet
   * @param {string} snippetName
   * @return {Promise<void>}
   */
  static async generate (snippetName) {
    const snippet = new Snippet()
    snippet.name = snippetName

    logger.info(`Creating ${snippet.name} Snippet`)

    snippet.rootFolder = path.join(env.PROJECT_CWD, Config.COLLECTION_SNIPPETS_SUBFOLDER, snippet.name)

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

    const collectionName = env.npm_package_name.includes('/') ? env.npm_package_name.split('/')[1] : env.npm_package_name

    const defaultFiles = []

    defaultFiles['/package.json'] = `{
  "author": "Archetype Themes Limited Partnership",
  "description": "${collectionName}'s ${snippet.name} Snippet",
  "license": "UNLICENSED",
  "main": "src/${snippet.name}.liquid",
  "name": "${Config.PACKAGES_SCOPE}/${snippet.name}",
  "packageManager": "yarn@${Config.YARN_VERSION}",
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

    defaultFiles['/README.md'] = `# ${collectionName}'s ${snippet.name} Snippet
This snippet is intended to be bundled in a theme through an Archetype components' collection monorepo.
`

    // Snippet Liquid file
    defaultFiles[`/src/${snippet.name}.liquid`] = ``

    // Schema
    defaultFiles['/src/schema.json'] = `{

}
`

    // Locales
    defaultFiles['/src/locales/locales.json'] = `{
  "en": {
    "snippet_name": "${snippet.name}"
  },
  "es": {
    "snippet_name": "${snippet.name}"
  },
  "fr": {
    "snippet_name": "${snippet.name}"
  }
}
`

    defaultFiles['/src/locales/locales.schema.json'] = `{
  "en": {
    "snippet_name": "${snippet.name}"
  },
  "es": {
    "snippet_name": "${snippet.name}"
  },
  "fr": {
    "snippet_name": "${snippet.name}"
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

  }
}

export default SnippetGenerator
