class ComponentBuild {
  /** @type {string} **/
  #liquidCode

  /** @type {Object} **/
  #locales

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
}

export default ComponentBuild
