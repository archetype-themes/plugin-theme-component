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

    // Assemble settings schema
    const rendersSettingsSchema = RecursiveRenderUtils.getSnippetsSettingsSchema(section.renders)
    section.build.settingsSchema = merge(section.settingsSchema, rendersSettingsSchema)
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
   * @param {string} targetBundleStylesheet
   * @return {Promise<string>}
   */
  static async bundleStyles (collectionRootFolder, sectionMainStylesheet, sectionBuildStylesheet, sectionRenders, targetBundleStylesheet) {
    let mainStylesheets = []

    if (sectionMainStylesheet) {
      mainStylesheets.push(sectionMainStylesheet)
    }

    if (sectionRenders) {
      mainStylesheets = mainStylesheets.concat(RecursiveRenderUtils.getSnippetsMainStylesheet(sectionRenders))
    }

    return StylesProcessor.buildStylesBundle(mainStylesheets, targetBundleStylesheet, collectionRootFolder)
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

    if (sectionFiles.schemaLocaleFiles.length) {
      mkdirPromises.push(mkdir(sectionBuild.localesFolder, { recursive: true }))
    }

    if (sectionFiles.snippetFiles.length) {
      mkdirPromises.push(mkdir(sectionBuild.snippetsFolder, { recursive: true }))
    }

    if (sectionBuild.settingsSchema) {
      mkdirPromises.push(mkdir(sectionBuild.configFolder, { recursive: true }))
    }

    if (sectionFiles.javascriptFiles.length || sectionFiles.stylesheets.length) {
      mkdirPromises.push(mkdir(sectionBuild.assetsFolder, { recursive: true }))
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
    const fileOperationPromises = []
    await this.resetBuildFolders(section.files, section.build)

    // Bundle CSS
    section.build.stylesBundle =
      await this.bundleStyles(
        collectionRootFolder,
        section.files.mainStylesheet,
        section.build.stylesheet,
        section.renders,
        section.build.stylesBundleFile
      )
    fileOperationPromises.push(FileUtils.writeFile(section.build.stylesBundleFile, section.build.stylesBundle))

    // Attach CSS bundle file reference to liquid code
    section.build.liquidCode =
      LiquidUtils.generateStylesheetReference(path.basename(section.build.stylesBundleFile)) + '\n' +
      section.build.liquidCode

    // Build JS
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
    section.build.liquidCode =
      LiquidUtils.generateJavascriptFileReference(path.basename(section.build.javascriptFile)) + '\n' +
      section.build.liquidCode

    // Write Schema Locales to disk
    fileOperationPromises.push(LocaleUtils.writeSchemaLocales(
      section.build.schemaLocales,
      section.build.localesFolder
    ))

    // Write Settings Schema to disk.
    fileOperationPromises.push(FileUtils.writeFile(section.build.settingsSchemaFile, JSON.stringify(section.build.settingsSchema)))

    // Copy Assets
    let assetFiles = section.files.assetFiles
    assetFiles = assetFiles.concat(RecursiveRenderUtils.getSnippetAssets(section.renders))
    fileOperationPromises.push(FileUtils.copyFilesToFolder(assetFiles, section.build.assetsFolder))

    fileOperationPromises.push(FileUtils.writeFile(section.build.liquidFile, section.build.liquidCode))
    const { liquidFilesWritePromise } = RecursiveRenderUtils.getSnippetsLiquidFilesWritePromise(section.renders, section.build.snippetsFolder)
    fileOperationPromises.push(liquidFilesWritePromise)
    return Promise.all(fileOperationPromises)
  }
}

export default SectionBuilder
