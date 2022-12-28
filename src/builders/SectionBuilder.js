// NodeJs imports
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'path'

// External Libraries imports
import merge from 'deepmerge'

// Archie Component imports
import ArchieCLI from '../cli/models/ArchieCLI.js'
import BuildFactory from '../factory/BuildFactory.js'
import Section from '../models/Section.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import NodeUtils from '../utils/NodeUtils.js'
import RenderUtils from '../utils/RenderUtils.js'
import StylesUtils from '../utils/StylesUtils.js'

class SectionBuilder {

  /**
   * Build Section
   * @param {Section} section
   * @returns {Promise<Awaited<unknown>[]>} - disk write operations array
   */
  static async build (section) {
    const sectionBuild = (ArchieCLI.commandOption === Section.COMPONENT_NAME)
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
    section.build.schema = merge(section.schema, snippetsSchema)

    section.build.liquidCode =
      await this.buildLiquid(section.liquidCode, section.build.schema, section.renders, section.build.snippetsFolder)

    if (sectionBuild) {
      // Bundle CSS
      section.build.stylesBundle =
        await this.bundleStyles(section.files.mainStylesheet, section.build.stylesheet, section.renders, section.build.stylesBundleFile)
      fileOperationPromises.push(FileUtils.writeFile(section.build.stylesBundleFile, section.build.stylesBundle))

      //Attach CSS bundle file reference to liquid code
      section.build.liquidCode =
        LiquidUtils.generateStylesheetReference(path.basename(section.build.stylesBundle)) + section.build.liquidCode

      // Build JS
      const rendersJavascriptIndexes = RenderUtils.getSnippetsJavascriptIndex(section.renders)
      if (section.files.javascriptIndex) {
        await JavaScriptProcessor.buildJavaScript(section.build.javascriptFile, section.files.javascriptIndex, rendersJavascriptIndexes)
      } else if (rendersJavascriptIndexes.length > 0) {
        await JavaScriptProcessor.buildJavaScript(section.build.javascriptFile, rendersJavascriptIndexes.shift(), rendersJavascriptIndexes)
      }

      //Attach Javascript bundle file reference to liquid code
      section.build.liquidCode =
        LiquidUtils.generateJavascriptFileReference(path.basename(section.build.javascriptFile)) +
        section.build.liquidCode

      // Assemble Schema Locales
      const renderSchemaLocales = RenderUtils.getSnippetsSchemaLocales(section.renders)
      section.build.schemaLocales = this.buildSchemaLocales(section.name, section.schemaLocales, renderSchemaLocales)
      fileOperationPromises.push(this.writeSchemaLocales(section.build.schemaLocales, section.build.localesFolder))

      // Copy Assets
      const assetFiles = section.files.assetFiles
      assetFiles.concat(RenderUtils.getSnippetAssets(section.renders))
      fileOperationPromises.push(FileUtils.copyFilesToFolder(assetFiles, section.build.assetsFolder))

    }

    fileOperationPromises.push(FileUtils.writeFile(section.build.liquidFile, section.build.liquidCode))

    return Promise.all(fileOperationPromises)
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
   * @param {Object[]} sectionSchemaLocales
   * @param {Object[]} snippetSchemaLocales
   * @return {Object[]}
   */
  static buildSchemaLocales (sectionName, sectionSchemaLocales, snippetSchemaLocales) {
    let buildSchemaLocales = []

    if (sectionSchemaLocales && sectionSchemaLocales.length > 0) {
      buildSchemaLocales = sectionSchemaLocales
    }

    if (snippetSchemaLocales && snippetSchemaLocales.length > 0) {
      if (buildSchemaLocales.length > 0) {
        buildSchemaLocales = NodeUtils.mergeObjectArrays(buildSchemaLocales, snippetSchemaLocales)
      } else {
        buildSchemaLocales = snippetSchemaLocales
      }
    }

    // Make sure all Schema Locales are in the appropriate section namespace
    for (const [locale, json] of buildSchemaLocales) {
      buildSchemaLocales[locale] = {
        sections: {
          [sectionName]: json
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

  /**
   * Write Schema Locales
   * @param {Object[]} schemaLocales
   * @param {string} localesFolder
   * @return {Promise<Awaited<undefined>[]>}
   */
  static async writeSchemaLocales (schemaLocales, localesFolder) {
    const promises = []
    for (const [locale, json] of schemaLocales) {
      const schemaLocaleFilename = path.join(localesFolder, `${locale}.schema.json`)
      const localeJsonString = JSON.stringify(json, null, 2)
      promises.push(writeFile(schemaLocaleFilename, localeJsonString))
    }
    return Promise.all(promises)
  }

}

export default SectionBuilder
