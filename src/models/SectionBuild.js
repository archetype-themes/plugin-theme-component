import ComponentBuild from './abstract/ComponentBuild.js'

class SectionBuild extends ComponentBuild {
  /** @type {SectionSchema} **/
  #schema

  /** @type {Object} **/
  #schemaLocales

  /** @type {Object} **/
  #settingsSchema

  /** @type {string} **/
  #snippetsFolder

  /**
   * Get Section schema
   * @return {SectionSchema}
   */
  get schema () {
    return this.#schema
  }

  /**
   * Set Section schema
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
   * Set Schema locales
   * @param {Object} value
   */
  set schemaLocales (value) {
    this.#schemaLocales = value
  }

  /**
   * Get Settings Schema
   * @return {Object}
   */
  get settingsSchema () {
    return this.#settingsSchema
  }

  /**
   * Set Settings Schema
   * @param {Object} value
   */
  set settingsSchema (value) {
    this.#settingsSchema = value
  }

  /**
   * Get Build Snippets Folder
   * @returns {string}
   */
  get snippetsFolder () {
    return this.#snippetsFolder
  }

  /**
   * Set Build Snippets Folder
   * @param {string} value
   */
  set snippetsFolder (value) {
    this.#snippetsFolder = value
  }
}

export default SectionBuild
