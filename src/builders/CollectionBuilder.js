//Node imports
import { access, constants, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { env } from 'node:process'
import { basename, join } from 'path'

//Archie imports
import SectionBuilder from './SectionBuilder.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'

class CollectionBuilder {
  static backupFiles

  /**
   * Build Collection Javascript
   * @param {Collection} collection
   * @returns {Promise<void>}
   */
  static async buildJavascript (collection) {
    const includedSnippets = []
    let mainFile
    const injectedFiles = []

    for (const section of collection.sections) {
      // Add Section file
      if (!mainFile && section.files.javascriptIndex) {
        mainFile = section.files.javascriptIndex
      } else if (section.files.javascriptIndex) {
        injectedFiles.push(section.files.javascriptIndex)
      }

      // Add Section snippet files
      if (section.renders) {
        for (const render of section.renders) {
          if (!includedSnippets.includes(render.snippetName) && render.snippet.files.javascriptIndex) {
            injectedFiles.push(render.snippet.files.javascriptIndex)
            includedSnippets.push(render.snippetName)
          }
        }
      }
    }

    if (mainFile && injectedFiles.length > 0) {
      await JavaScriptProcessor.buildJavaScript(collection.build.javascriptFile, mainFile, injectedFiles)
    } else if (mainFile) {
      await JavaScriptProcessor.buildJavaScript(collection.build.javascriptFile, mainFile)
    }

  }

  /**
   * Build Main Stylesheet
   * @param {Collection} collection
   * @returns {Promise<void>}
   */
  static async buildStylesheets (collection) {

    const stylesheets = []
    for (const section of collection.sections) {
      if (section.build.stylesheet) {
        try {
          await access(section.build.stylesheet, constants.R_OK)
          stylesheets.push(section.build.stylesheet)
        } catch {
          // Error is expected if the stylesheet was not created
        }

      }
    }
    const mergedStylesheets = await FileUtils.getMergedFilesContent(stylesheets)
    await FileUtils.writeFile(collection.build.stylesheet, mergedStylesheets)
  }

  /**
   *
   * @param {Collection} collection
   * @return {Promise<void>}
   */
  static async build (collection) {
    logger.info(`Building ${collection.name} Collection ...`)
    console.time(`Building "${collection.name}" collection`)

    logger.info(`We will bundle the following sections: ${collection.sectionNames.join(', ')}`)

    for (const section of collection.sections) {
      await SectionBuilder.build(section)

      for (const schemaLocale in section.schemaLocales) {
        if (!collection.schemaLocales[schemaLocale]) {
          collection.schemaLocales[schemaLocale] = {}
          collection.schemaLocales[schemaLocale]['sections'] = {}
        }

        collection.schemaLocales[schemaLocale]['sections'][section.name] = section.schemaLocales[schemaLocale]
      }
    }

    await this.#resetBuildFolders(collection)

    for (const section of collection.sections) {
      try {
        await FileUtils.copyFolder(section.build.rootFolder, collection.build.sectionsFolder)
      } catch {
        //Errors ignored as some sections folders might not exist if there is no particular content for that section
      }
      try {
        await FileUtils.copyFolder(section.build.snippetsFolder, collection.build.snippetsFolder)
      } catch {
        //Errors ignored as some sections folders might not exist if there is no particular content for that section
      }

    }

    await Promise.all([
      this.buildJavascript(collection),
      this.buildStylesheets(collection),
      this.writeSchemaLocales(collection)]
    ).then(() => {
      logger.info(`${collection.name}: Build Complete`)
      console.timeEnd(`Building "${collection.name}" collection`)
      console.log('\n')
    })

  }

  /**
   * Reset Collection Build Folders
   * @param {Collection} collection
   * @return {Promise<void>}
   */
  static async #resetBuildFolders (collection) {
    await rm(collection.build.rootFolder, { force: true, recursive: true })

    await mkdir(collection.build.rootFolder, { recursive: true })
    await mkdir(collection.build.assetsFolder, { recursive: true })
    await mkdir(collection.build.localesFolder, { recursive: true })
    await mkdir(collection.build.sectionsFolder, { recursive: true })
    await mkdir(collection.build.snippetsFolder, { recursive: true })
  }

  /**
   * Write Schema Locales
   * @param {Collection} collection
   * @return {Promise<void>}
   */
  static async writeSchemaLocales (collection) {

    for (const schemaLocale in collection.schemaLocales) {
      const schemaLocaleFileName = join(collection.build.localesFolder, `${schemaLocale}.schema.json`)
      const localeJsonString = JSON.stringify(collection.schemaLocales[schemaLocale], null, 2)
      await writeFile(schemaLocaleFileName, localeJsonString)
    }
  }

  /**
   * Install Collection Within a Theme
   * @param {Collection} collection
   * @param {Theme} theme
   * @return {Promise<void>}
   */
  static async install (collection, theme) {
    logger.info(`Installing ${collection.name} Collection for ${env.npm_package_name}.`)
    console.time(`Installing ${collection.name} Collection for ${env.npm_package_name}.`)

    const filesToBackup = []
    const filesToCopy = []

    let injectJavascript = false, injectStylesheet = false

    // JavaScript
    if (collection.build.javascriptFile && await FileUtils.exists(collection.build.javascriptFile)) {
      const javascriptFileBasename = basename(collection.build.javascriptFile)
      const targetFile = join(theme.assetsFolder, javascriptFileBasename)

      logger.debug(`Source Collection Javascript file ${javascriptFileBasename} found.`)

      if (await FileUtils.exists(targetFile)) {
        logger.debug(`Target Collection Javascript file ${javascriptFileBasename} exists - backup requested.`)
        filesToBackup.push(targetFile)
      }
      filesToCopy[collection.build.javascriptFile] = targetFile
      injectJavascript = true
    }

    // Stylesheet
    if (collection.build.stylesheet && await FileUtils.exists(collection.build.stylesheet)) {
      const stylesheetBasename = basename(collection.build.stylesheet)
      const targetFile = join(theme.assetsFolder, stylesheetBasename)

      logger.debug(`Source Collection Stylesheet file ${stylesheetBasename} found.`)

      if (await FileUtils.exists(targetFile)) {
        logger.debug(`Target Collection Stylesheet file ${stylesheetBasename} exists - backup requested.`)
        filesToBackup.push(targetFile)
      }
      filesToCopy[collection.build.stylesheet] = targetFile
      injectStylesheet = true
    }

    // Sections
    logger.debug('Reading Section Files')
    const sectionsContents = await readdir(collection.build.sectionsFolder, { withFileTypes: true })

    for (const sectionsEntry of sectionsContents) {
      if (sectionsEntry.isFile() && sectionsEntry.name.toLowerCase().endsWith('.liquid')) {
        const targetFile = join(theme.sectionsFolder, sectionsEntry.name)
        if (await FileUtils.exists(targetFile)) {
          logger.debug(`Section file ${basename(targetFile)} exists - backup requested.`)
          filesToBackup.push(targetFile)
        }
        filesToCopy[join(collection.build.sectionsFolder, sectionsEntry.name)] = targetFile
      }
    }

    // Snippets
    logger.debug('Reading Snippet Files')
    const snippetsContents = await readdir(collection.build.snippetsFolder, { withFileTypes: true })

    for (const snippetsEntry of snippetsContents) {
      if (snippetsEntry.isFile() && snippetsEntry.name.toLowerCase().endsWith('.liquid')) {
        const targetFile = join(theme.snippetsFolder, snippetsEntry.name)
        // Verify if file exists & Backup existing file
        if (await FileUtils.exists(targetFile)) {
          logger.debug(`Snippet file ${basename(targetFile)} exists - backup requested.`)
          filesToBackup.push(targetFile)
        }
        filesToCopy[join(collection.build.snippetsFolder, snippetsEntry.name)] = targetFile
      }
    }

    if (filesToBackup.length) {
      logger.debug(`Backing up ${filesToBackup.length} files`)
      await FileUtils.backup(filesToBackup)

    } else {
      logger.debug('No files to backup')
    }

    logger.debug(`Copying ${Object.keys(filesToCopy).length} files`)
    await FileUtils.copy(filesToCopy)

    logger.info('Collection Files Installed Successfully.')

    if (injectJavascript || injectStylesheet) {
      await this.injectAssetReferences(collection, theme, {
        'injectJavascript': injectJavascript,
        'injectStylesheet': injectStylesheet
      })
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
        injections.push(`<script src="{{ ${javascriptFileBasename} | asset_url }}" async></script>`)
      }
    }

    if (options.injectStylesheet) {
      if (themeLiquid.includes(stylesheetBasename)) {
        logger.warn(`Html "link" tag injection Unavailable: A conflictual reference to ${stylesheetBasename} is already present within the theme.liquid file.`)
      } else {
        injections.push(`<link type="text/css" href="{{ ${stylesheetBasename} | asset_url }}" rel="stylesheet">`)
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

export default CollectionBuilder
