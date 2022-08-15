import logger from '../utils/Logger.js'
import Snippet from '../models/Snippet.js'
import path, { basename } from 'path'
import SnippetFactory from '../factory/SnippetFactory.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import FileUtils from '../utils/FileUtils.js'
import ComponentBuilder from './ComponentBuilder.js'

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
   * Build Section Locales
   * @param {Section} section
   */
  static buildLocales (section) {
    // TODO: Locale Files from Snippets should be merged
    section.files.localeFiles.forEach(file => FileUtils.copyFileOrDie(file, `${section.build.localesFolder}/${basename(file)}`))
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
        let snippet = new Snippet()

        // Look within the section's local snippets first
        for (const snippetFile in section.files.snippetFiles) {
          if (render.snippetName === path.parse(snippetFile).name) {
            snippet.files.liquidFiles = [section.files.snippetFiles[snippetFile]]
            break
          }
        }

        // Generate from the packages folder if it wasn't found locally
        if (snippet.files.liquidFiles.length === 0) {
          snippet = await SnippetFactory.fromName(render.snippetName)
        }

        snippetCache[render.snippetName] = snippet
      }

      render.snippet = snippetCache[render.snippetName]

      if (!render.hasForClause()) {

        let snippetLiquidCode = await LiquidUtils.getRenderSnippetInlineLiquidCode(render)

        section.liquidCode.replace(render.liquidTag, snippetLiquidCode)
      } else {
        // Copy snippet liquid files since we can't inline a for loop
        console.log(render.snippet.name)
        await FileUtils.writeFileOrDie(`${section.build.snippetsFolder}/${render.snippet.name}.liquid`, render.snippet.liquidCode)
      }

    }
  }
}

export default SectionBuilder
