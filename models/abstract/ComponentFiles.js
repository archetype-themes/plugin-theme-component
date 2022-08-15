class ComponentFiles {
  #javascriptFiles
  #javascriptIndex
  #liquidFiles
  #localeFiles
  #mainStylesheet
  #schemaFile
  #stylesheets

  constructor () {
    if (new.target === ComponentFiles) {
      throw new TypeError('Cannot construct ComponentFiles instances directly')
    }

    this.javascriptFiles = []
    this.liquidFiles = []
    this.localeFiles = []
    this.stylesheets = []
  }

  /**
   * Get Javascript Files
   * @returns {string[]}
   */
  get javascriptFiles () {
    return this.#javascriptFiles
  }

  /**
   * Set Javascript Files
   * @param {string[]} value
   */
  set javascriptFiles (value) {
    this.#javascriptFiles = value
  }

  /**
   * Get Javascript Index File
   * @returns {string}
   */
  get javascriptIndex () {
    return this.#javascriptIndex
  }

  /**
   * Set Javascript Index File
   * @param {string} value
   */
  set javascriptIndex (value) {
    this.#javascriptIndex = value
  }

  /**
   * Get Liquid Files
   * @returns {string[]}
   */
  get liquidFiles () {
    return this.#liquidFiles
  }

  /**
   * Set Liquid Files
   * @param {string[]} value
   */
  set liquidFiles (value) {
    this.#liquidFiles = value
  }

  /**
   * Get Locale Files
   * @returns {string[]}
   */
  get localeFiles () {
    return this.#localeFiles
  }

  /**
   * Set Locale Files
   * @param {string[]} value
   */
  set localeFiles (value) {
    this.#localeFiles = value
  }

  /**
   * Get Main Stylesheet
   * @returns {string}
   */
  get mainStylesheet () {
    return this.#mainStylesheet
  }

  /**
   * Set Main Stylesheet
   * @param {string} value
   */
  set mainStylesheet (value) {
    this.#mainStylesheet = value
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
   * Get Stylesheets
   * @returns {string[]}
   */
  get stylesheets () {
    return this.#stylesheets
  }

  /**
   * Set Stylesheets
   * @param {string[]} value
   */
  set stylesheets (value) {
    this.#stylesheets = value
  }
}

export default ComponentFiles
