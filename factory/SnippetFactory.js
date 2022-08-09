import { cwd } from 'node:process'
import { dirname } from 'path'
import Snippet from '../models/Snippet.js'

class SnippetFactory {

  /**
   *
   * @param {Render} render
   * @returns {Promise<Snippet>}
   */
  static async fromRender (render) {
    const snippet = new Snippet()
    snippet.name = render.snippetName

    // Set snippet folders
    snippet.rootFolder = `${dirname(cwd())}/${snippet.name}`
    snippet.buildFolder = snippet.rootFolder + '/build'
    snippet.assetsBuildFolder = snippet.buildFolder + '/assets'
    snippet.localesBuildFolder = snippet.buildFolder + '/locales'

    return snippet
  }
}

export default SnippetFactory