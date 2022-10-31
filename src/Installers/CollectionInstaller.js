// Node Core imports
import { readdir } from 'node:fs/promises'
import { basename, join } from 'node:path'
// Archie  imports
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'

class CollectionInstaller {

  /**
   * Install Collection Within a Theme
   * @param {Theme} theme
   * @param {Collection} collection
   * @return {Promise<void>}
   */
  static async install (theme, collection) {
    logger.info(`Installing the ${collection.name} Collection for the ${theme.name} Theme.`)
    console.time(`Installing the ${collection.name} Collection for the ${theme.name} Theme.`)

    const filesToCopy = []

    let injectJavascript = false, injectStylesheet = false

    // JavaScript
    if (collection.build.javascriptFile && await FileUtils.exists(collection.build.javascriptFile)) {
      const javascriptFileBasename = basename(collection.build.javascriptFile)

      logger.debug(`Source Collection Javascript file ${javascriptFileBasename} found.`)

      filesToCopy[collection.build.javascriptFile] = join(theme.assetsFolder, javascriptFileBasename)
      injectJavascript = true
    }

    // Stylesheet
    if (collection.build.stylesheet && await FileUtils.exists(collection.build.stylesheet)) {
      const stylesheetBasename = basename(collection.build.stylesheet)

      logger.debug(`Source Collection Stylesheet file ${stylesheetBasename} found.`)

      filesToCopy[collection.build.stylesheet] = join(theme.assetsFolder, stylesheetBasename)
      injectStylesheet = true
    }

    // Sections
    logger.debug('Reading Section Files')
    const sectionsContents = await readdir(collection.build.sectionsFolder, { withFileTypes: true })

    for (const sectionsEntry of sectionsContents) {
      if (sectionsEntry.isFile() && sectionsEntry.name.toLowerCase().endsWith('.liquid')) {
        filesToCopy[join(collection.build.sectionsFolder, sectionsEntry.name)] = join(theme.sectionsFolder, sectionsEntry.name)
      }
    }

    // Snippets
    logger.debug('Reading Snippet Files')
    const snippetsContents = await readdir(collection.build.snippetsFolder, { withFileTypes: true })

    for (const snippetsEntry of snippetsContents) {
      if (snippetsEntry.isFile() && snippetsEntry.name.toLowerCase().endsWith('.liquid')) {
        filesToCopy[join(collection.build.snippetsFolder, snippetsEntry.name)] = join(theme.snippetsFolder, snippetsEntry.name)
      }
    }

    await this.backupFiles(filesToCopy)

    logger.debug(`Copying ${Object.keys(filesToCopy).length} files`)
    await FileUtils.copy(filesToCopy)

    logger.info('Collection Files Installed Successfully.')

    if (injectJavascript || injectStylesheet) {
      await this.injectAssetReferences(collection, theme, {
        'injectJavascript': injectJavascript,
        'injectStylesheet': injectStylesheet
      })
    }

    logger.info(`${collection.name}: Install Complete`)
    console.timeEnd(`Installing the ${collection.name} Collection for the ${theme.name} Theme.`)
    console.log('\n')
  }

  static async backupFiles (filesToCopy) {
    const filesToBackup = []

    for (const fileToCopy of filesToCopy) {
      if (await FileUtils.exists(fileToCopy)) {
        logger.debug(`File "${basename(fileToCopy)}" exists - backup requested.`)
        filesToBackup.push(fileToCopy)
      }
    }

    if (filesToBackup.length) {
      logger.debug(`Backing up ${filesToBackup.length} files`)
      await FileUtils.backup(filesToBackup)

    } else {
      logger.debug('No files to backup')
    }
  }

  static async injectAssetReferences (collection, theme, options) {
    const javascriptFileBasename = basename(collection.build.javascriptFile)
    const stylesheetBasename = basename(collection.build.stylesheet)

    let injections = []

    const themeLiquidFile = join(theme.rootFolder, 'layout', 'theme.liquid')
    let themeLiquid = (await FileUtils.isReadable(themeLiquidFile)) ? await FileUtils.getFileContents(themeLiquidFile) : ''

    if (options.injectJavascript) {
      if (themeLiquid.includes(javascriptFileBasename)) {
        logger.warn(`Html "script" tag injection unavailable: A conflictual reference to ${javascriptFileBasename} is already present within the theme.liquid file.`)
      } else {
        injections.push(`<script src="{{ '${javascriptFileBasename}' | asset_url }}" async></script>`)
      }
    }

    if (options.injectStylesheet) {
      if (themeLiquid.includes(stylesheetBasename)) {
        logger.warn(`Html "link" tag injection Unavailable: A conflictual reference to ${stylesheetBasename} is already present within the theme.liquid file.`)
      } else {
        injections.push(`<link type="text/css" href="{{ '${stylesheetBasename}' | asset_url }}" rel="stylesheet">`)
      }
    }

    if (await FileUtils.isWritable(themeLiquidFile)) {
      if (injections.length > 0) {
        await this.writeAssetReferencesToThemeLiquidFile(injections, themeLiquid, themeLiquidFile)

      }
    } else if (injections.length > 0) {
      this.injectionFailureWarning(`Theme Liquid file (${themeLiquidFile}) is not writable.`, injections)
    }
  }

  static async writeAssetReferencesToThemeLiquidFile (injections, themeLiquid, themeLiquidFile) {
    const headTagClosureCount = (themeLiquid.match(/<\/head>/g) || []).length
    if (headTagClosureCount === 1) {
      logger.debug('Injecting theme.liquid file with Collection Stylesheet and/or JavaScript file references.')
      themeLiquid = themeLiquid.replace(
        '</head>',
        `${injections.join('\n')}\n</head>`)
      await FileUtils.backup(themeLiquidFile)
      await FileUtils.writeFile(themeLiquidFile, themeLiquid)

    } else if (headTagClosureCount === 0) {
      this.injectionFailureWarning(`Html head tag closure not found in "theme.liquid".`, injections)
    } else {
      this.injectionFailureWarning(`${headTagClosureCount} Html head tag closure found in "theme.liquid". It should only be present once.`, injections)
    }

  }

  static injectionFailureWarning (message, injections) {
    logger.warn(`
**************************************************************************************************
${message}

References to collection stylesheet and javaScript file will not be inserted automatically.
You should manually insert these lines inside your "theme.liquid" file:

 >>> ${injections.join('\n >>> ')}

**************************************************************************************************`)

  }
}

export default CollectionInstaller
