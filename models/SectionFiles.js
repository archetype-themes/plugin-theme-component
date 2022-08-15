import ComponentFiles from './abstract/ComponentFiles.js'

class SectionFiles extends ComponentFiles {
  #schemaFile
  #snippetFiles

  constructor () {
    super()
    this.snippetFiles = []
  }

  /**
   *  Get Schema File
   * @returns {string}
   */
  get schemaFile () {
    return this.#schemaFile
  }

  /**
   * Set Schema File
   * @param {string} value
   */
  set schemaFile (value) {
    this.#schemaFile = value
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
