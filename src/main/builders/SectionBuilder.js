// NodeJs imports
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

    // Build Section Schema (this includes previously collated locales through factory methods
    const snippetsSchema = RecursiveRenderUtils.getSnippetsSchema(section.renders)
    section.build.schema = SectionSchemaUtils.merge(section.schema, snippetsSchema)

    section.build.liquidCode = await this.buildLiquid(section.liquidCode, section.build.schema)

    // Assemble Schema Locales
    const renderSchemaLocales = RecursiveRenderUtils.getSnippetsSchemaLocales(section.renders)
    section.build.schemaLocales = this.buildSchemaLocales(section.name, section.schemaLocales, renderSchemaLocales)
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
   *
   * @param {string} sectionName
   * @param {Object} [sectionSchemaLocales={}]
   * @param {Object} [snippetsSchemaLocales={}]
   * @return {Object}
   */
  static buildSchemaLocales (sectionName, sectionSchemaLocales = {}, snippetsSchemaLocales = {}) {
    let buildSchemaLocales = {}

    buildSchemaLocales = merge(buildSchemaLocales, sectionSchemaLocales)
    buildSchemaLocales = merge(buildSchemaLocales, snippetsSchemaLocales)

    // Put Schema Locales in the appropriate section namespace
    for (const locale of Object.keys(buildSchemaLocales)) {
      buildSchemaLocales[locale] = {
        sections: {
          [sectionName]: buildSchemaLocales[locale]
        }
      }
    }

    return buildSchemaLocales
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
   * @param {SectionBuild} sectionBuild
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async resetBuildFolders (sectionFiles, sectionBuild) {
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

    if (sectionFiles.snippetFiles.length) {
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
    await this.resetBuildFolders(section.files, section.build)

    // Build & Write JS
    const rendersJavascriptIndexes = RecursiveRenderUtils.getSnippetsJavascriptIndex(section.renders)
    if (section.files.javascriptIndex) {
      await JavaScriptProcessor.buildJavaScript(
        collectionRootFolder,
        section.build.javascriptFile,
        section.files.javascriptIndex,
        rendersJavascriptIndexes
      )
    } else if (rendersJavascriptIndexes.length) {
      await JavaScriptProcessor.buildJavaScript(
        collectionRootFolder,
        section.build.javascriptFile,
        rendersJavascriptIndexes.shift(),
        rendersJavascriptIndexes
      )
    }

    // Attach Javascript bundle file reference to liquid code
    if (section.files.javascriptIndex || rendersJavascriptIndexes.length) {
      section.build.liquidCode =
        LiquidUtils.generateJavascriptFileReference(path.basename(section.build.javascriptFile)) + '\n' +
        section.build.liquidCode
    }

    const { liquidFilesWritePromise } = RecursiveRenderUtils.getSnippetsLiquidFilesWritePromise(section.renders, section.build.snippetsFolder)

    return Promise.all([
      LocaleUtils.writeSchemaLocales(section.build.schemaLocales, section.build.localesFolder),
      FileUtils.copyFilesToFolder(assetFiles, section.build.assetsFolder),
      FileUtils.writeFile(section.build.stylesheet, section.build.styles),
      FileUtils.writeFile(section.build.liquidFile, section.build.liquidCode),
      FileUtils.writeFile(section.build.settingsSchemaFile, JSON.stringify(section.build.settingsSchema, null, 2)),
      liquidFilesWritePromise
    ])
  }
}

export default SectionBuilder
