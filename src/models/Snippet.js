import Component from './abstract/Component.js'

class Snippet extends Component {
  /** @type {SnippetBuild} **/
  #build
  /** @type {SnippetFiles} **/
  #files

  /**
   *  Get Build
   * @returns {SnippetBuild}
   */
  get build () {
    return this.#build
  }

  /**
   * Set Build
   * @param {SnippetBuild} value
   */
  set build (value) {
    this.#build = value
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
