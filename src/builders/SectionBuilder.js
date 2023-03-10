// NodeJs imports
import { mkdir, rm } from 'node:fs/promises'
import path from 'path'

// Archie Component imports
import CLISession from '../cli/models/CLISession.js'
import BuildFactory from '../factory/BuildFactory.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import LocaleUtils from '../utils/LocaleUtils.js'
import NodeUtils from '../utils/NodeUtils.js'
import RenderUtils from '../utils/RenderUtils.js'
import SectionSchemaUtils from '../utils/SectionSchemaUtils.js'
import StylesUtils from '../utils/StylesUtils.js'
import Components from '../config/Components.js'

class SectionBuilder {
  /**
   * Build Section
   * @param {Section} section
   * @returns {Promise<Awaited<void>[]>} - disk write operations array
   */
  static async build (section) {
    const sectionBuild = (
      CLISession.commandOption === Components.SECTION_COMPONENT_NAME
    )
    const fileOperationPromises = []

    // Create build model and prepare folders
    section.build = BuildFactory.fromSection(section)
    await this.resetBuildFolders(section.files, section.build)

    await RenderUtils.buildSnippets(section.renders)

    // Build Section CSS if it is a Sass file because it doesn't play well with PostCSS style bundles
    // This excludes snippets recursive CSS
    if (section.files.mainStylesheet && StylesUtils.isSassFile(section.files.mainStylesheet)) {
      section.build.styles = await StylesProcessor.buildStyles(section.files.mainStylesheet, section.build.stylesheet)
      fileOperationPromises.push(FileUtils.writeFile(section.build.stylesheet, section.build.styles))
    }

    // Recursively check for Snippet Schema
    const snippetsSchema = RenderUtils.getSnippetsSchema(section.renders)
    section.build.schema = SectionSchemaUtils.merge(section.schema, snippetsSchema)

    section.build.liquidCode =
      await this.buildLiquid(section.liquidCode, section.build.schema, section.renders, section.build.snippetsFolder)

    // Assemble Schema Locales
    const renderSchemaLocales = RenderUtils.getSnippetsSchemaLocales(section.renders)
    section.build.schemaLocales = this.buildSchemaLocales(section.name, section.schemaLocales, renderSchemaLocales)

    if (sectionBuild) {
      // Bundle CSS
      section.build.stylesBundle =
        await this.bundleStyles(
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
      const rendersJavascriptIndexes = RenderUtils.getSnippetsJavascriptIndex(section.renders)
      if (section.files.javascriptIndex) {
        await JavaScriptProcessor.buildJavaScript(
          section.build.javascriptFile,
          section.files.javascriptIndex,
          rendersJavascriptIndexes
        )
      } else if (rendersJavascriptIndexes.length > 0) {
        await JavaScriptProcessor.buildJavaScript(
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

      // Copy Assets
      let assetFiles = section.files.assetFiles
      assetFiles = assetFiles.concat(RenderUtils.getSnippetAssets(section.renders))
      fileOperationPromises.push(FileUtils.copyFilesToFolder(assetFiles, section.build.assetsFolder))
    }

    fileOperationPromises.push(FileUtils.writeFile(section.build.liquidFile, section.build.liquidCode))

    return Promise.all(fileOperationPromises)
  }

  /**
   * Build multiple Sections
   * @param {Section[]} sections
   * @returns {Promise<Awaited<void>[]>}
   */
  static async buildMany (sections) {
    const promises = []
    for (const section of sections) {
      promises.push(SectionBuilder.build(section))
    }
    return Promise.all(promises)
  }

  /**
   * Build Liquid
   * @override
   * @param {string} liquidCode
   * @param {SectionSchema} schema
   * @param {Render[]} renders
   * @param {string} snippetsFolder
   * @return {Promise<string>}
   */
  static async buildLiquid (liquidCode, schema, renders, snippetsFolder) {
    let buildLiquidCode = liquidCode

    //  Replace renders tags with the proper snippet liquid code recursively
    if (renders.length > 0) {
      buildLiquidCode = await LiquidUtils.inlineOrCopySnippets(buildLiquidCode, renders, snippetsFolder)
    }

    // Append section schema to liquid code
    if (schema) {
      buildLiquidCode += `\n{% schema %}\n${JSON.stringify(schema, null, 2)}\n{% endschema %}`
    }

    return buildLiquidCode
  }

  /**
   *
   * @param {string} sectionName
   * @param {Object[]} [sectionSchemaLocales=[]]
   * @param {Object[]} [snippetSchemaLocales=[]]
   * @return {Object[]}
   */
  static buildSchemaLocales (sectionName, sectionSchemaLocales = [], snippetSchemaLocales = []) {
    let buildSchemaLocales = []

    buildSchemaLocales = NodeUtils.mergeObjectArrays(buildSchemaLocales, sectionSchemaLocales)
    buildSchemaLocales = NodeUtils.mergeObjectArrays(buildSchemaLocales, snippetSchemaLocales)

    // Make sure all Schema Locales are in the appropriate section namespace
    for (const locale in buildSchemaLocales) {
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
   * @param {string} sectionMainStylesheet
   * @param {string} sectionBuildStylesheet
   * @param {Render[]} sectionRenders
   * @param {string} targetBundleStylesheet
   * @return {Promise<string>}
   */
  static async bundleStyles (sectionMainStylesheet, sectionBuildStylesheet, sectionRenders, targetBundleStylesheet) {
    let mainStylesheets = []

    if (sectionMainStylesheet) {
      if (StylesUtils.isSassFile(sectionMainStylesheet)) {
        mainStylesheets.push(sectionBuildStylesheet)
      } else {
        mainStylesheets.push(sectionMainStylesheet)
      }
    }

    if (sectionRenders) {
      mainStylesheets = mainStylesheets.concat(RenderUtils.getSnippetsMainStylesheet(sectionRenders))
    }

    return StylesProcessor.buildStylesBundle(mainStylesheets, targetBundleStylesheet)
  }

  /**
   *
   * @param {SectionFiles} sectionFiles
   * @param {SectionBuild} sectionBuild
   */
  static async resetBuildFolders (sectionFiles, sectionBuild) {
    await rm(sectionBuild.rootFolder, { force: true, recursive: true })
    await mkdir(sectionBuild.rootFolder, { recursive: true })

    if (sectionFiles.schemaLocaleFiles.length > 0) {
      await mkdir(sectionBuild.localesFolder, { recursive: true })
    }

    if (sectionFiles.snippetFiles.length > 0) {
      await mkdir(sectionBuild.snippetsFolder, { recursive: true })
    }

    if (sectionFiles.javascriptFiles.length > 0 || sectionFiles.stylesheets.length > 0) {
      await mkdir(sectionBuild.assetsFolder, { recursive: true })
    }
  }
}

export default SectionBuilder
