import Component from './abstract/Component.js'
import SnippetFiles from './SnippetFiles.js'

class Snippet extends Component {
  #files

  constructor () {
    super()
    this.files = new SnippetFiles()
  }

  /**
   * Get Files Model Reference
   * @returns {SnippetFiles}
   */
  get files () {
    return this.#files
  }

  /**
   * Set Files Model Reference
   * @param {SnippetFiles} value
   */
  set files (value) {
    this.#files = value
  }
}

export default Snippet
