import { mkdir, writeFile } from 'node:fs/promises'
import path, { basename, join } from 'path'
import merge from 'deepmerge'

// Archie Components
import ComponentBuilder from './ComponentBuilder.js'
import SnippetBuilder from './SnippetBuilder.js'
import SnippetFactory from '../factory/SnippetFactory.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import logger from '../utils/Logger.js'

class SectionBuilder extends ComponentBuilder {

  /**
   * Build Section
   * @param {Section} section
   * @returns {Promise<Section>}
   */
  static async build (section) {
    logger.info(`Building "${section.name}" section`)
    console.time(`Building "${section.name}" section`)

    await this.resetBuildFolders(section)

    //  Fill renders with the proper snippet object
    if (section.renders.length > 0) {
      await mkdir(section.build.snippetsFolder, { recursive: true })
      await this.buildSnippets(section)
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
    section.liquidCode = `<script src="{{ ${basename(section.build.javascriptFile)} | asset_url }}" async></script>\n${section.liquidCode}`
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
      const schemaLocaleFileName = join(section.build.localesFolder, `${schemaLocale}.schema.json`)
      const localeJson = {}
      localeJson['sections'] = {}
      localeJson['sections'][section.name] = {}
      localeJson['sections'][section.name][schemaLocale] = section.schemaLocales[schemaLocale]
      const localeJsonString = JSON.stringify(localeJson, null, 2)
      await writeFile(schemaLocaleFileName, localeJsonString)
    }
  }

  /**
   * Build Section Snippets
   * @param {Section} section
   * @returns {Promise<void>}
   */
  static async buildSnippets (section) {

    logger.debug(`Processing section's "render" tags`)

    const snippetCache = []

    for (const render of section.renders) {
      // Create snippet from render and put into cache
      if (!snippetCache[render.snippetName]) {
        logger.debug(`${section.name}: Building "${render.snippetName}" Snippet`)

        // Look within the section's local snippets first
        for (const snippetFile of section.files.snippetFiles) {
          if (render.snippetName === path.parse(snippetFile).name) {
            snippetCache[render.snippetName] = await SnippetFactory.fromSingleFile(render.snippetName, snippetFile)
            break
          }
        }

        // Generate from the packages folder if it wasn't found locally
        if (!snippetCache[render.snippetName]) {
          const snippet = await SnippetFactory.fromName(render.snippetName)
          if (snippet.schema && section.schema) {
            section.schema = merge(section.schema, snippet.schema)
          }

          if (snippet.locales && section.locales) {
            section.locales = merge(section.locales, snippet.locales)
          }

          snippetCache[render.snippetName] = snippet
        }

      }

      render.snippet = snippetCache[render.snippetName]

      if (!render.hasForClause()) {
        // Prepends variables creation to accompany liquid code injection
        let snippetLiquidCode = await LiquidUtils.getRenderSnippetInlineLiquidCode(render)

        section.liquidCode = section.liquidCode.replace(render.liquidTag, snippetLiquidCode)
      } else {
        // Copy snippet liquid files since we can't inline a for loop
        await FileUtils.writeFile(`${section.build.snippetsFolder}/${render.snippet.name}.liquid`, render.snippet.liquidCode)
      }

    }
  }

  /**
   * Build Main Stylesheet
   * @param {Section} section
   * @returns {Promise<void>}
   */
  static async buildStylesheets (section) {
    await StylesProcessor.buildStyles(section.build.stylesheet, section.files.mainStylesheet)

    const processedSnippets = []
    const stylesheets = [section.build.stylesheet]

    if (section.renders) {
      for (const render of section.renders) {
        if (render.snippet.files.mainStylesheet && !processedSnippets.includes(render.snippetName)) {
          await SnippetBuilder.buildStylesheets(render.snippet)

          stylesheets.push(render.snippet.build.stylesheet)
          processedSnippets.push(render.snippetName)
        }
      }
    }

    const styles = await FileUtils.getMergedFilesContent(stylesheets)
    await FileUtils.writeFile(section.build.stylesheet, styles)
    section.liquidCode = `<link type="text/css" href="{{ ${basename(section.build.stylesheet)} | asset_url }}" rel="stylesheet">\n${section.liquidCode}`

  }
}

export default SectionBuilder
