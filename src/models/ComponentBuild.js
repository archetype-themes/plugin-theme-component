class ComponentBuild {
  /** @type {string} **/
  #liquidCode

  /** @type {Object} **/
  #locales

  /** @type {SectionSchema} **/
  #schema

  /** @type {Object} **/
  #schemaLocales

  /**
   * Get liquid code
   * @return {string}
   */
  get liquidCode () {
    return this.#liquidCode
  }

  /**
   * Set liquid code
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
}

export default ComponentBuild
