class Component {
  /** @type {string} **/
  #liquidCode

  /** @type {Object} **/
  #locales = {}

  /** @type {string} **/
  #name

  /** @type {string} **/
  #rootFolder

  /** @type {object} **/
  #schema

  /** @type {Object[][]} **/
  #schemaLocales = []

  constructor () {
    if (new.target === Component) {
      throw new TypeError('Cannot construct Component instances directly')
    }
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
   * Get Locales Multidimensional Array => locales[locale] = {}
   * @returns {Object[][]}
   */
  get locales () {
    return this.#locales
  }

  /**
   * Set Locales Multidimensional Array => locales[locale] = {}
   * @param {Object[][]} value
   */
  set locales (value) {
    this.#locales = value
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
   * Get Schema Object Representation
   * @returns {object}
   */
  get schema () {
    return this.#schema
  }

  /**
   * Get Schema Object Representation
   * @param {object} value
   */
  set schema (value) {
    this.#schema = value
  }

  /**
   * Get Schema Locales
   * @return {Object[][]}
   */
  get schemaLocales () {
    return this.#schemaLocales
  }

  /**
   * Set Schema Locales
   * @param {Object[][]} value
   */
  set schemaLocales (value) {
    this.#schemaLocales = value
  }
}

export default Component
