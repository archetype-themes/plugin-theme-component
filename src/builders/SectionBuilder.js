import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'path'
import merge from 'deepmerge'

// Archie Components
import ComponentBuilder from './ComponentBuilder.js'
import SnippetBuilder from './SnippetBuilder.js'
import ArchieCLI from '../cli/models/ArchieCLI.js'
import Section from '../models/Section.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import ComponentUtils from '../utils/ComponentUtils.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import logger from '../utils/Logger.js'
import RenderUtils from '../utils/RenderUtils.js'

class SectionBuilder extends ComponentBuilder {

  /**
   * Build Section
   * @param {Section} section
   * @returns {Promise<Section>}
   */
  static async build (section) {
    logger.info(`Building "${section.name}" section`)
    console.time(`Building "${section.name}" section`)

    await this.resetBuildFolders(section.files, section.build)

    //  Fill renders with the proper snippet object
    if (section.renders.length > 0) {
      await mkdir(section.build.snippetsFolder, { recursive: true })
      await this.processRenders(section)
    } else {
      logger.debug(`${section.name}: No "Render" tags found`)
    }

    // Process JavaScript files
    if (section.files.javascriptIndex) {
      logger.debug(`${section.name}: Processing JavaScript`)
      await SectionBuilder.buildJavascript(section)
      logger.debug(`${section.name}: Javascript build complete`)
    } else {
      logger.debug(`${section.name}: No external javaScript found`)
    }

    // Process CSS files
    if (section.files.mainStylesheet) {
      logger.debug(`${section.name}: Processing CSS files`)
      await this.buildStylesheets(section)
      logger.debug(`${section.name}: CSS build complete`)
    } else {
      logger.debug(`${section.name}: No external CSS`)
    }

    logger.debug(`${section.name}: Finalizing Liquid file`)
    await SectionBuilder.buildLocales(section)
    await SectionBuilder.buildLiquid(section)

    // Process Schema Locale Files
    if (section.schemaLocales) {
      logger.debug(`${section.name}: Processing Schema Locale files`)
      await mkdir(section.build.localesFolder, { recursive: true })
      await SectionBuilder.writeSchemaLocales(section)
    }

    logger.info(`${section.name}: Build Complete`)
    console.timeEnd(`Building "${section.name}" section`)
    console.log('\n')

    return section
  }

  /**
   * Build Section Javascript with snippet's JS as well
   * @param {Section} section
   * @returns {Promise<void>}
   */
  static async buildJavascript (section) {
    const includedSnippets = []
    const injectedFiles = []

    if (section.renders) {
      for (const render of section.renders) {
        if (!includedSnippets.includes(render.snippetName) && render.snippet.files.javascriptIndex) {
          injectedFiles.push(render.snippet.files.javascriptIndex)
          includedSnippets.push(render.snippetName)
        }
      }
    }

    if (injectedFiles.length > 0) {
      await JavaScriptProcessor.buildJavaScript(section.build.javascriptFile, section.files.javascriptIndex, injectedFiles)
    } else {
      await JavaScriptProcessor.buildJavaScript(section.build.javascriptFile, section.files.javascriptIndex)
    }
    if (ArchieCLI.commandOption === Section.COMPONENT_NAME) {
      section.liquidCode =
        `<script src="{{ '${path.basename(section.build.javascriptFile)}' | asset_url }}" async></script>\n${section.liquidCode}`
    }
  }

  /**
   * Build Section Locales
   * @param {Section} section
   */
  static async buildLocales (section) {
    const rendersProcessed = []
    for (const render of section.renders) {
      if (render.snippet && render.snippet.locales && !rendersProcessed.includes(render.snippet.name)) {
        section.locales = merge(section.locales, render.snippet.locales)
        rendersProcessed.push(render.snippet.name)
      }
    }

    if (section.locales) {
      if (section.schema.locales) {
        section.schema.locales = merge(section.schema.locales, section.locales)
      } else {
        section.schema.locales = section.locales
      }
      section.locales = section.schema.locales
    }
  }

  /**
   * Write Schema Locales
   * @param {Section} section
   * @return {Promise<void>}
   */
  static async writeSchemaLocales (section) {
    const rendersProcessed = []
    for (const render of section.renders) {
      if (render.snippet && render.snippet.schemaLocales && !rendersProcessed.includes(render.snippet.name)) {
        section.schemaLocales = merge(section.schemaLocales, render.snippet.schemaLocales)
        rendersProcessed.push(render.snippet.name)
      }
    }

    for (const schemaLocale in section.schemaLocales) {
      const schemaLocaleFileName = path.join(section.build.localesFolder, `${schemaLocale}.schema.json`)
      const localeJson = {}
      localeJson['sections'] = {}
      localeJson['sections'][section.name] = section.schemaLocales[schemaLocale]
      const localeJsonString = JSON.stringify(localeJson, null, 2)
      await writeFile(schemaLocaleFileName, localeJsonString)
    }
  }

  /**
   * Build Section Snippets
   * @param {Section} section
   * @returns {Promise<void>}
   */
  static async processRenders (section) {

    logger.debug(`Processing section's "render" tags`)

    for (const render of section.renders) {

      if (render.snippet.renders) {
        await SnippetBuilder.processRenders(render.snippet, section.build.snippetsFolder)
      }

      if (render.hasForClause()) {
        // Copy snippet liquid files since we can't inline a for loop
        await FileUtils.writeFile(`${section.build.snippetsFolder}/${render.snippet.name}.liquid`, render.snippet.liquidCode)
      } else {
        // Prepends variables creation to accompany liquid code injection
        let snippetLiquidCode = await LiquidUtils.getSnippetInlineLiquidCode(render)
        section.liquidCode = section.liquidCode.replace(render.liquidTag, snippetLiquidCode)
      }

      await ComponentUtils.mergeSnippetData(section, render.snippet)
    }
  }

  /**
   * Build Main Stylesheet
   * @param {Section} section
   * @returns {Promise<void>}
   */
  static async buildStylesheets (section) {
    let mainStylesheets = []
    if (section.files && section.files.mainStylesheet) {
      mainStylesheets.push(section.files.mainStylesheet)
    }

    if (section.renders) {
      mainStylesheets = mainStylesheets.concat(await RenderUtils.getMainStylesheets(section.renders))
    }

    let useMasterSassFile = StylesProcessor.canWeUseMasterSassFile(mainStylesheets)

    if (useMasterSassFile) {
      logger.debug('Using Sass to merge CSS')
      const masterSassFile = path.join(path.dirname(section.files.mainStylesheet), 'masterSassFile.tmp.sass')
      const masterSassFileContent = StylesProcessor.createMasterSassFile(mainStylesheets)
      await FileUtils.writeFile(masterSassFile, masterSassFileContent)
      const styles = await StylesProcessor.buildStyles(section.build.stylesheet, masterSassFile)
      await Promise.all([
        FileUtils.writeFile(section.build.stylesheet, styles),
        unlink(masterSassFile)
      ])
    } else {
      logger.debug('Using Collate to merge CSS')
      const sectionStyles = await StylesProcessor.buildStyles(section.build.stylesheet, section.files.mainStylesheet)
      await FileUtils.writeFile(section.build.stylesheet, sectionStyles)
      const buildStylesheets = [section.build.stylesheet]
      buildStylesheets.concat(await RenderUtils.getBuildStylesheets(section.renders))
      const styles = await FileUtils.getMergedFilesContent(buildStylesheets)
      await unlink(section.build.stylesheet)
      await FileUtils.writeFile(section.build.stylesheet, styles)
    }

    // Add CSS stylesheet reference to section liquid code only if we are building an individual section
    if (ArchieCLI.commandOption === Section.COMPONENT_NAME) {
      section.liquidCode =
        `<link type="text/css" href="{{ '${path.basename(section.build.stylesheet)}' | asset_url }}" rel="stylesheet">\n${section.liquidCode}`
    }

  }

}

export default SectionBuilder
