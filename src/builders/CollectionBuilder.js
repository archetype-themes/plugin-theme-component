//Node imports
import { access, constants, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { env } from 'node:process'
import { basename, join } from 'path'

//Archie imports
import SectionBuilder from './SectionBuilder.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'
import NodeUtils from '../utils/NodeUtils.js'

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

    // JavaScript
    if (collection.build.javascriptFile && await FileUtils.exists(collection.build.javascriptFile)) {
      logger.debug(`Source Collection Javascript file ${basename(collection.build.javascriptFile)} found.`)
      const targetFile = join(theme.assetsFolder, basename(collection.build.javascriptFile))
      if (await FileUtils.exists(targetFile)) {
        logger.debug(`Target Collection Javascript file ${basename(targetFile)} exists - backup requested.`)
        filesToBackup.push(targetFile)
      }
      filesToCopy[collection.build.javascriptFile] = targetFile
    }

    // Stylesheet
    if (collection.build.stylesheet && await FileUtils.exists(collection.build.stylesheet)) {
      logger.debug(`Source Collection Stylesheet file ${basename(collection.build.stylesheet)} found.`)
      const targetFile = join(theme.assetsFolder, basename(collection.build.stylesheet))
      if (await FileUtils.exists(targetFile)) {
        logger.debug(`Target Collection Stylesheet file ${basename(targetFile)} exists - backup requested.`)
        filesToBackup.push(targetFile)
      }
      filesToCopy[collection.build.stylesheet] = targetFile
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
      try {
        await FileUtils.backup(filesToBackup)
      } catch (error) {
        NodeUtils.exitWithError(error)
      }
    } else {
      logger.debug('No files to backup')
    }

    logger.debug(`Copying ${Object.keys(filesToCopy).length} files`)
    try {
      await FileUtils.copy(filesToCopy)
    } catch (error) {
      NodeUtils.exitWithError(error)
    }

    logger.info('Collection Files Installed Successfully.')

  }
}

export default CollectionBuilder
