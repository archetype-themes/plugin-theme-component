import SnippetBuilder from '../builders/SnippetBuilder.js'

class RenderUtils {
  /**
   * Get Stylesheets From Render
   * @param {Render[]} renders
   * @param {string[]} processedSnippets
   * @return {Promise<string[]>}
   */
  static async getMainStylesheets (renders, processedSnippets = []) {

    let stylesheets = []
    for (const render of renders) {
      if (render.snippet.files.mainStylesheet && !processedSnippets.includes(render.snippetName)) {
        await SnippetBuilder.buildStylesheets(render.snippet)
        stylesheets.push(render.snippet.files.mainStylesheet)
        processedSnippets.push(render.snippetName)

        if (render.snippet.renders) {
          stylesheets = stylesheets.concat(await this.getMainStylesheets(render.snippet.renders, processedSnippets))
        }

      }
    }
    return stylesheets
  }
}

export default RenderUtils
