import Component from './abstract/Component.js'

class Snippet extends Component {
  /** @type {string} **/
  static COMPONENT_NAME = 'snippet'

  /**
   * @override
   * @type {SnippetBuild}
   */
  #build
  /**
   * @override
   * @type {SnippetFiles}
   */
  #files

  /**
   * Get Build
   * @override
   * @returns {SnippetBuild}
   */
  get build () {
    return this.#build
  }

  /**
   * Set Build
   * @override
   * @param {SnippetBuild} value
   */
  set build (value) {
    this.#build = value
  }

  /**
   * Get Files Model Reference
   * @override
   * @returns {SnippetFiles}
   */
  get files () {
    return this.#files
  }

  /**
   * Set Files Model Reference
   * @override
   * @param {SnippetFiles} value
   */
  set files (value) {
    this.#files = value
  }
}

export default Snippet
