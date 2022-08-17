import ComponentFiles from './abstract/ComponentFiles.js'

class SectionFiles extends ComponentFiles {
  /** @type {string[][]} **/
  #snippetFiles = []

  /**
   * Get Snippet Files Object
   * #snippetFiles{snippetName: snippetFile}
   * @returns {string[][]}
   */
  get snippetFiles () {
    return this.#snippetFiles
  }

  /**
   * Set Snippet Files Object
   * #snippetFiles{snippetName: snippetFile}
   * @param {string[][]} value
   */
  set snippetFiles (value) {
    this.#snippetFiles = value
  }
}

export default SectionFiles
