import SectionSchema from '../SectionSchema.js'

class Component {
  /** @type {ComponentBuild} */
  #build
  /** @type {ComponentFiles} **/
  #files

  /** @type {string} **/
  #liquidCode

  /** @type {string} **/
  #name

  /** @type {Render[]} **/
  #renders = []

  /** @type {string} **/
  #rootFolder

  /** @type {SectionSchema} **/
  #schema

  /** @type {Object[]} **/
  #schemaLocales = []

  constructor () {
    if (new.target === Component) {
      throw new TypeError('Cannot construct Component instances directly')
    }
  }

  /**
   * Get Component Build
   * @return {ComponentBuild}
   */
  get build () {
    return this.#build
  }

  /**
   * Set Component Build
   * @param {ComponentBuild} value
   */
  set build (value) {
    this.#build = value
  }

  /**
   * Get Component Files
   * @return {ComponentFiles}
   */
  get files () {
    return this.#files
  }

  /**
   * Set Component Files
   * @param {ComponentFiles} value
   */
  set files (value) {
    this.#files = value
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
   * @returns {Object}
   */
  get locales () {
    if (this.schema && this.schema.locales) {
      return this.schema.locales
    }
    return null
  }

  /**
   * Set Locales Multidimensional Array => locales[locale] = {}
   * @param {Object} value
   */
  set locales (value) {
    if (this.schema) {
      this.schema.locales = value
    } else if (this.schema) {
      this.schema.locales = value
    } else {
      this.schema = new SectionSchema()
      this.schema.locales = value
    }

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
   * Get Renders
   * @returns {Render[]}
   */
  get renders () {
    return this.#renders
  }

  /**
   * Set Renders
   * @param {Render[]} value
   */
  set renders (value) {
    this.#renders = value
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
   * @return {Object[]}
   */
  get schemaLocales () {
    return this.#schemaLocales
  }

  /**
   * Set Schema Locales
   * @param {Object[]} value
   */
  set schemaLocales (value) {
    this.#schemaLocales = value
  }
}

export default Component
