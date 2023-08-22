// Node.js imports
import merge from 'deepmerge'
import { mkdir, rm } from 'node:fs/promises'
import path from 'path'

// Archie Component imports
import BuildFactory from '../factory/BuildFactory.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import FileUtils from '../../utils/FileUtils.js'
import LiquidUtils from '../../utils/LiquidUtils.js'
import LocaleUtils from '../../utils/LocaleUtils.js'
import RecursiveRenderUtils from '../../utils/RecursiveRenderUtils.js'
import SectionSchemaUtils from '../../utils/SectionSchemaUtils.js'

class SectionBuilder {
  /**
   * Build Section
   * @param {Section} section - The Section model instance
   * @returns {Promise<void>}
   */
  static async build (section) {
    // Create build module
    section.build = BuildFactory.fromSection(section)

    // Build Locales
    section.build.locales = LocaleUtils.buildLocales(section.name, section.locales, section.schema?.locales)
    section.build.schemaLocales = LocaleUtils.buildLocales(section.name, section.schemaLocales)

    // Build Section Schema (this includes previously collated locales through factory methods
    const snippetsSchema = RecursiveRenderUtils.getSnippetsBuildSchema(section.renders)
    if (section.schema || snippetsSchema) {
      section.build.schema = SectionSchemaUtils.build(section.schema, snippetsSchema)
    }

    section.build.liquidCode = await this.buildLiquid(section.liquidCode, section.build.schema)
  }

  /**
   * Build Liquid
   * @override
   * @param {string} liquidCode
   * @param {SectionSchema} schema
   * @return {Promise<string>}
   */
  static async buildLiquid (liquidCode, schema) {
    let buildLiquidCode = liquidCode

    // Append section schema to liquid code
    if (schema) {
      buildLiquidCode += `\n{% schema %}\n${JSON.stringify(schema, null, 2)}\n{% endschema %}`
    }

    return buildLiquidCode
  }

  /**
   * Bundle Styles
   * Create a CSS bundle file for the section and all its snippets
   * @param {string} collectionRootFolder
   * @param {string} sectionMainStylesheet
   * @param {string} sectionBuildStylesheet
   * @param {Render[]} sectionRenders
   * @return {Promise<string|void>}
   */
  static async bundleStyles (collectionRootFolder, sectionMainStylesheet, sectionBuildStylesheet, sectionRenders) {
    let mainStylesheets = []

    if (sectionMainStylesheet) {
      mainStylesheets.push(sectionMainStylesheet)
    }

    if (sectionRenders) {
      mainStylesheets = mainStylesheets.concat(RecursiveRenderUtils.getSnippetsMainStylesheet(sectionRenders))
    }

    if (mainStylesheets.length > 0) {
      return StylesProcessor.buildStylesBundle(mainStylesheets, sectionBuildStylesheet, collectionRootFolder)
    }
  }

  /**
   * Reset Build Folders
   * @param {SectionFiles} sectionFiles
   * @param {Render[]} sectionRenders
   * @param {SectionBuild} sectionBuild
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async resetBuildFolders (sectionFiles, sectionRenders, sectionBuild) {
    await rm(sectionBuild.rootFolder, { force: true, recursive: true })
    await mkdir(sectionBuild.rootFolder, { recursive: true })

    const mkdirPromises = []

    if (sectionFiles.javascriptFiles.length || sectionFiles.stylesheets.length || sectionFiles.assetFiles.length > 0) {
      mkdirPromises.push(mkdir(sectionBuild.assetsFolder, { recursive: true }))
    }

    if (sectionFiles.schemaLocaleFiles.length) {
      mkdirPromises.push(mkdir(sectionBuild.localesFolder, { recursive: true }))
    }

    if (sectionBuild.settingsSchema) {
      mkdirPromises.push(mkdir(sectionBuild.configFolder, { recursive: true }))
    }

    if (sectionFiles.snippetFiles.length || !!sectionRenders.length) {
      mkdirPromises.push(mkdir(sectionBuild.snippetsFolder, { recursive: true }))
    }

    return Promise.all(mkdirPromises)
  }

  /**
   * Write Section Build To Disk
   * @param {Section} section - The Section model instance
   * @param {string} [collectionRootFolder] - Collection Root folder, used to get config files for css & js processors
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async writeBuild (section, collectionRootFolder) {
    // Bundle CSS
    section.build.styles =
      await this.bundleStyles(
        collectionRootFolder,
        section.files.mainStylesheet,
        section.build.stylesheet,
        section.renders
      )

    // Attach CSS bundle file reference to liquid code
    if (section.build.styles) {
      section.build.liquidCode =
        LiquidUtils.generateStylesheetReference(path.basename(section.build.stylesheet)) + '\n' +
        section.build.liquidCode
    }

    // Build Settings Schema
    const rendersSettingsSchema = RecursiveRenderUtils.getSnippetsSettingsSchema(section.renders)
    if (section.settingsSchema?.length) {
      section.build.settingsSchema = section.settingsSchema.concat(rendersSettingsSchema)
    } else {
      section.build.settingsSchema = rendersSettingsSchema
    }

    // Get all Section and Snippet Assets
    let assetFiles = section.files.assetFiles
    assetFiles = assetFiles.concat(RecursiveRenderUtils.getSnippetAssets(section.renders))

    // IMPORTANT: No disk write operation should occur BEFORE this
    await this.resetBuildFolders(section.files, section.renders, section.build)

    // Build & Write JS
    const jsFiles = section.files.javascriptIndex ? [section.files.javascriptIndex] : []
    jsFiles.push(...RecursiveRenderUtils.getSnippetsJavascriptIndex(section.renders))

    if (jsFiles.length) {
      // Generate Javascript Bundle File
      await JavaScriptProcessor.buildJavaScript(jsFiles, section.build.javascriptFile, collectionRootFolder)

      // Attach Javascript bundle file reference to liquid code
      section.build.liquidCode =
        LiquidUtils.generateJavascriptFileReference(path.basename(section.build.javascriptFile)) + '\n' +
        section.build.liquidCode
    }

    const { liquidFilesWritePromise } = RecursiveRenderUtils.getSnippetsLiquidFilesWritePromise(section.renders, section.build.snippetsFolder)
    const filesWritePromises = [
      LocaleUtils.writeLocales(this.assembleLocales(section.build.locales, section.renders), section.build.localesFolder),
      LocaleUtils.writeLocales(this.assembleLocales(section.build.schemaLocales, section.renders, true), section.build.localesFolder, true),
      FileUtils.copyFilesToFolder(assetFiles, section.build.assetsFolder),
      FileUtils.writeFile(section.build.liquidFile, section.build.liquidCode),
      liquidFilesWritePromise
    ]

    if (section.build.styles) {
      filesWritePromises.push(FileUtils.writeFile(section.build.stylesheet, section.build.styles))
    }
    if (section.build.settingsSchema?.length) {
      filesWritePromises.push(FileUtils.writeFile(section.build.settingsSchemaFile, JSON.stringify(section.build.settingsSchema, null, 2)))
    }

    return Promise.all(filesWritePromises)
  }

  /**
   * Assemble Locales
   * @param {Object} sectionLocales
   * @param {Render[]} renders
   * @param {boolean} [isSchemaLocales=false] Defaults to storefront locales
   * @returns {Object}
   */
  static assembleLocales (sectionLocales, renders, isSchemaLocales = false) {
    const renderLocales = RecursiveRenderUtils.getSnippetsBuildLocales(renders, isSchemaLocales)
    return merge(sectionLocales, renderLocales)
  }
}

export default SectionBuilder
