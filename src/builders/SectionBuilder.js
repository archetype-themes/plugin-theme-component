import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path, { basename } from 'path'
import merge from 'deepmerge'
import ComponentBuilder from './ComponentBuilder.js'
import SnippetBuilder from './SnippetBuilder.js'
import SnippetFactory from '../factory/SnippetFactory.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import logger from '../utils/Logger.js'
import SectionFactory from '../factory/SectionFactory.js'

class SectionBuilder extends ComponentBuilder {

  /**
   * Build Section
   * @param {string} sectionName
   * @returns {Promise<Section>}
   */
  static async build (sectionName) {
    logger.info(`Building "${sectionName}" section`)
    console.time(`Building "${sectionName}" section`)

    const section = await SectionFactory.fromName(sectionName)

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

    // Process Locale Files
    if (section.files.localeFiles.length > 0) {
      await mkdir(section.build.localesFolder, { recursive: true })

      logger.debug(`${section.name}: ${section.files.localeFiles.length} Locale file${section.files.localeFiles.length > 1 ? 's' : ''} found`)
      logger.debug(`${section.name}: Processing Locale files`)

      await SectionBuilder.buildLocales(section)

      logger.debug(`${section.name}: Locales build complete`)
    } else {
      logger.debug(`${section.name}: No Locale files found`)
    }

    logger.debug(`${section.name}: Finalizing Liquid file`)
    await SectionBuilder.buildLiquid(section)

    logger.info(`${section.name}: Build Complete`)
    console.timeEnd(`Building "${sectionName}" section`)
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
    // TODO: Locale Files from Snippets should be merged
    section.files.localeFiles.forEach(file => copyFile(file, `${section.build.localesFolder}/${basename(file)}`))

    for (const locale in section.locales) {
      await writeFile(section.build.localesFolder + '/' + locale + '.json', JSON.stringify(section.locales[locale], null, 2))
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

    stylesheets.unshift(section.build.stylesheet)
    const styles = await FileUtils.getMergedFilesContent(stylesheets)
    await FileUtils.writeFile(section.build.stylesheet, styles)
    section.liquidCode = `<link type="text/css" href="{{ ${basename(section.build.stylesheet)} | asset_url }}" rel="stylesheet">\n${section.liquidCode}`

  }
}

export default SectionBuilder
