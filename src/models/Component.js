class Component {
  /** @type {string} **/
  #name

  /** @type {string} **/
  #rootFolder

  /** @type {ComponentFiles} **/
  #files

  /** @type {ComponentBuild} **/
  #build

  /** @type {string} **/
  #liquidCode

  /** @type {SectionSchema} **/
  #schema

  /** @type {Object } **/
  #locales = {}

  /** @type {string[]} **/
  #snippetNames

  /** @type {Snippet[]} **/
  #snippets = []

  /**
   * Constructor
   * @param {string} [name] - Component Name
   * @param {string} [path] - Component Path
   */
  constructor (name, path) {
    if (name) this.name = name
    if (path) this.rootFolder = path
  }

  /**
   * Get Name
   * @returns {string}
   */
  get name () {
    return this.#name
  }

  /**
   * Set Name
   * @param {string} value
   */
  set name (value) {
    this.#name = value
  }

  /**
   * Get Root Folder
   * @returns {string}
   */
  get rootFolder () {
    return this.#rootFolder
  }

  /**
   * Set Root Folder
   * @param {string} value
   */
  set rootFolder (value) {
    this.#rootFolder = value
  }

  /**
   * Get Files
   * @returns {ComponentFiles}
   */
  get files () {
    return this.#files
  }

  /**
   * Set Files
   * @param {ComponentFiles} value
   */
  set files (value) {
    this.#files = value
  }

  /**
   * Get Build
   * @returns {ComponentBuild}
   */
  get build () {
    return this.#build
  }

  /**
   * Set Build
   * @param {ComponentBuild} value
   */
  set build (value) {
    this.#build = value
  }

  /**
   * Get Liquid Code
   * @returns {string}
   */
  get liquidCode () {
    return this.#liquidCode
  }

  /**
   * Liquid Code
   * @param {string} value
   */
  set liquidCode (value) {
    this.#liquidCode = value
  }

  /**
   * Get Locales
   * @return {Object}
   */
  get locales () {
    return this.#locales
  }

  /**
   * Set Locales
   * @param {Object} value
   */
  set locales (value) {
    this.#locales = value
  }

  /**
   * Get Schema Object Representation
   * @returns {SectionSchema}
   */
  get schema () {
    return this.#schema
  }

  /**
   * Get Schema Object Representation
   * @param {SectionSchema} value
   */
  set schema (value) {
    this.#schema = value
  }

  /**
   * Get Snippet Names
   * @returns {string[]}
   */
  get snippetNames () {
    return this.#snippetNames
  }

  /**
   * Set Snippet Names
   * @param {string[]}value
   */
  set snippetNames (value) {
    this.#snippetNames = value
  }

  /**
   * Get Snippets
   * @returns {Snippet[]}
   */
  get snippets () {
    return this.#snippets
  }

  /**
   * Set Snippets
   * @param {Snippet[]} value
   */
  set snippets (value) {
    this.#snippets = value
  }
}

export default Component
