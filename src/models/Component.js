class Component {
  /** @type {string} **/
  #name

  /** @type {string} **/
  #rootFolder

  /**
   * @type {ComponentFiles}
   */
  #files

  /**
   * @type {ComponentBuild}
   */
  #build

  /** @type {string} **/
  #liquidCode

  /** @type {SectionSchema} **/
  #schema

  /** @type {Object } **/
  #locales = {}

  /** @type {Object} **/
  #schemaLocales = {}

  /** @type {Object[]} **/
  #settingsSchema

  /** @type {Snippet[]} **/
  #snippets = []

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
   * Get Schema Locales
   * @return {Object}
   */
  get schemaLocales () {
    return this.#schemaLocales
  }

  /**
   * Set Schema Locales
   * @param {Object} value
   */
  set schemaLocales (value) {
    this.#schemaLocales = value
  }

  /**
   * Get Settings Schema
   * @return {Object[]}
   */
  get settingsSchema () {
    return this.#settingsSchema
  }

  /**
   * Set Settings Schema
   * @param {Object[]} value
   */
  set settingsSchema (value) {
    this.#settingsSchema = value
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
