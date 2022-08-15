import ComponentFiles from './abstract/ComponentFiles.js'

class SectionFiles extends ComponentFiles {
  #snippetFiles

  constructor () {
    super()
    this.snippetFiles = []
  }

  /**
   * Get Snippet Files Associative Array
   * #snippetFiles[snippetName][snippetFile]
   * @returns {string[]}
   */
  get snippetFiles () {
    return this.#snippetFiles
  }

  /**
   * Set Snippet Files
   * #snippetFiles[snippetName][snippetFile]
   * @param {string[]} value
   */
  set snippetFiles (value) {
    this.#snippetFiles = value
  }
}

export default SectionFiles
