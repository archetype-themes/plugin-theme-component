import ComponentFiles from './abstract/ComponentFiles.js'

class SectionFiles extends ComponentFiles {
  #snippetFiles

  constructor () {
    super()
    this.snippetFiles = {}
  }

  /**
   * Get Snippet Files Object
   * #snippetFiles{snippetName: snippetFile}
   * @returns {Object}
   */
  get snippetFiles () {
    return this.#snippetFiles
  }

  /**
   * Set Snippet Files Object
   * #snippetFiles{snippetName: snippetFile}
   * @param {Object} value
   */
  set snippetFiles (value) {
    this.#snippetFiles = value
  }
}

export default SectionFiles
