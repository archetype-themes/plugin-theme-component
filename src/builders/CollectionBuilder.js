//Node imports
import { access, constants, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'path'

//Archie imports
import SectionBuilder from './SectionBuilder.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import logger from '../utils/Logger.js'

class CollectionBuilder {
  static backupFiles

  /**
   * Build Collection Javascript
   * @param {module:models/Collection} collection
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
   * @param {module:models/Collection} collection
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
   * @param {module:models/Collection} collection
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
   * @param {module:models/Collection} collection
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
   * @param {module:models/Collection} collection
   * @return {Promise<void>}
   */
  static async writeSchemaLocales (collection) {

    for (const schemaLocale in collection.schemaLocales) {
      const schemaLocaleFileName = join(collection.build.localesFolder, `${schemaLocale}.schema.json`)
      const localeJsonString = JSON.stringify(collection.schemaLocales[schemaLocale], null, 2)
      await writeFile(schemaLocaleFileName, localeJsonString)
    }
  }

}

export default CollectionBuilder
