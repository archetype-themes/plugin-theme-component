import path, { basename } from 'path'
import ComponentBuilder from './ComponentBuilder.js'
import SnippetFactory from '../factory/SnippetFactory.js'
import JavaScriptProcessor from '../processors/JavaScriptProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import logger from '../utils/Logger.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import SnippetBuilder from './SnippetBuilder.js'
import { copyFile } from 'node:fs/promises'

class SectionBuilder extends ComponentBuilder {

  /**
   * Build Section
   * @param {Section} section
   * @returns {Promise<void>}
   */
  static async build (section) {

    await this.buildSnippets(section)

    await this.buildJavascript(section)
    await this.buildStylesheets(section)
    this.buildLocales(section)

    await this.buildLiquid(section)

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
  static buildLocales (section) {
    // TODO: Locale Files from Snippets should be merged
    section.files.localeFiles.forEach(file => copyFile(file, `${section.build.localesFolder}/${basename(file)}`))
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
        for (const snippetFile in section.files.snippetFiles) {
          if (render.snippetName === path.parse(snippetFile).name) {
            snippetCache[render.snippetName] = await SnippetFactory.fromSingleFile(render.snippetName, section.files.snippetFiles[snippetFile])
            break
          }
        }

        // Generate from the packages folder if it wasn't found locally
        if (!snippetCache[render.snippetName]) {
          snippetCache[render.snippetName] = await SnippetFactory.fromName(render.snippetName)
        }
      }

      render.snippet = snippetCache[render.snippetName]

      if (!render.hasForClause()) {

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
