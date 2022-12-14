import SnippetBuilder from '../builders/SnippetBuilder.js'
import StylesProcessor from '../processors/StylesProcessor.js'
import merge from 'deepmerge'

class RenderUtils {
  /**
   * Get Main Stylesheets From Renders
   * @param {Render[]} renders
   * @param {string[]} [processedSnippets=[]]
   * @return {Promise<string[]>}
   */
  static async getMainStylesheets (renders, processedSnippets = []) {

    let stylesheets = []
    for (const render of renders) {
      if (render.snippet.files.mainStylesheet && !processedSnippets.includes(render.snippetName)) {
        if (StylesProcessor.isSassFile(render.snippet.files.mainStylesheet)) {
          // If the main stylesheet is a sass file, it will be rendered and the build file will be used instead.
          // This is because PostCSS and Sass do not play well together
          await SnippetBuilder.buildStylesheets(render.snippet)
          stylesheets.push(render.snippet.build.stylesheet)
        } else {
          stylesheets.push(render.snippet.files.mainStylesheet)
        }

        processedSnippets.push(render.snippetName)

        if (render.snippet.renders) {
          stylesheets = stylesheets.concat(await this.getMainStylesheets(render.snippet.renders, processedSnippets))
        }

      }
    }
    return stylesheets
  }

  /**
   * Merge Render Snippet data into Section data
   * @param {Section} section
   * @param {Snippet} snippet
   * @param {string[]} [processedSnippets=[]]
   */
  static mergeSnippetData (section, snippet, processedSnippets = []) {

    // Merge snippet schema data into section
    if (snippet.schema) {
      if (section.schema) {
        section.schema = merge(section.schema, snippet.schema)
      } else {
        section.schema = snippet.schema
      }
    }

    // Merge snippet locale data into section
    if (snippet.locales) {
      if (section.locales) {
        section.locales = merge(section.locales, snippet.locales)
      } else {
        section.locales = snippet.locales
      }
    }

    if (snippet.renders) {
      for (const render of snippet.renders)
        this.mergeSnippetData(section, render.snippet)
    }

  }
}

export default RenderUtils
