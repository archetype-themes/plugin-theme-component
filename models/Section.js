import Snippet from './Snippet.js'

class Section extends Snippet {
  constructor () {
    super()
    this.liquidCode = ''
    this.renders = []
    this.snippetFiles = []
  }

  /**
   * Get Schema File
   * @returns {string}
   */
  get schemaFile () {
    return this._schemaFile
  }

  /**
   * Set Schema File
   * @param {string} schemaFile
   */
  set schemaFile (schemaFile) {
    this._schemaFile = schemaFile
  }

  /**
   * Get SnippetFiles
   * @returns {string[][]}
   */
  get snippetFiles () {
    return this._snippetFiles
  }

  /**
   * Set Snippet Files
   * @param {string[][]} snippetFiles
   */
  set snippetFiles (snippetFiles) {
    this._snippetFiles = snippetFiles
  }

  /**
   * Get Renders
   * @returns {Render[]}
   */
  get renders () {
    return this._renders
  }

  /**
   * Set Renders
   * @param {Render[]} renders
   */
  set renders (renders) {
    this._renders = renders
  }

}

export default Section