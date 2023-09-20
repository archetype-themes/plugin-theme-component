class ComponentFiles {
  /** @type {string[]} */
  #assetFiles = []

  /** @type {string[]}
   * @default **/
  #javascriptFiles = []

  /** @type {string} **/
  #javascriptIndex

  /** @type {string[]} **/
  #liquidFiles = []

  /** @type {string[]} **/
  #localeFiles = []

  /** @type {string} **/
  #mainStylesheet

  /** @type {string} **/
  #packageJson

  /** @type {string} **/
  #schemaFile

  /** @type {string[]} **/
  #schemaLocaleFiles = []

  /** @type {string} **/
  #settingsSchemaFile

  /** @type {string[]} **/
  #snippetFiles = []

  /** @type {string[]} **/
  #stylesheets = []

  /**
   * Get Asset Files
   * @return {string[]}
   */
  get assetFiles () {
    return this.#assetFiles
  }

  /**
   * Set Asset Files
   * @param {string[]} value
   */
  set assetFiles (value) {
    this.#assetFiles = value
  }

  /**
   * Get Javascript Files' locations
   * @returns {string[]}
   */
  get javascriptFiles () {
    return this.#javascriptFiles
  }

  /**
   * Set Javascript Files' locations
   * @param {string[]} value
   */
  set javascriptFiles (value) {
    this.#javascriptFiles = value
  }

  /**
   * Get Javascript Index File location
   * @returns {string}
   */
  get javascriptIndex () {
    return this.#javascriptIndex
  }

  /**
   * Set Javascript Index File location
   * @param {string} value
   */
  set javascriptIndex (value) {
    this.#javascriptIndex = value
  }

  /**
   * Get Liquid Files' locations
   * @returns {string[]}
   */
  get liquidFiles () {
    return this.#liquidFiles
  }

  /**
   * Set Liquid Files' locations
   * @param {string[]} value
   */
  set liquidFiles (value) {
    this.#liquidFiles = value
  }

  /**
   * Get Locale Files' locations
   * @returns {string[]}
   */
  get localeFiles () {
    return this.#localeFiles
  }

  /**
   * Set Locale Files' locations
   * @param {string[]} value
   */
  set localeFiles (value) {
    this.#localeFiles = value
  }

  /**
   * Get Main Stylesheet file location
   * @returns {string}
   */
  get mainStylesheet () {
    return this.#mainStylesheet
  }

  /**
   * Set Main Stylesheet file location
   * @param {string} value
   */
  set mainStylesheet (value) {
    this.#mainStylesheet = value
  }

  /**
   * Get package.json file location
   * @return {string}
   */
  get packageJson () {
    return this.#packageJson
  }

  /**
   * Set package.json file location
   * @param {string} value
   */
  set packageJson (value) {
    this.#packageJson = value
  }

  /**
   *  Get Schema File location
   * @returns {string}
   */
  get schemaFile () {
    return this.#schemaFile
  }

  /**
   * Set Schema File location
   * @param {string} value
   */
  set schemaFile (value) {
    this.#schemaFile = value
  }

  /**
   * Get Schema Locale Files' location
   * @return {string[]}
   */
  get schemaLocaleFiles () {
    return this.#schemaLocaleFiles
  }

  /**
   * Set Schema Locale Files' locations
   * @param {string[]} value
   */
  set schemaLocaleFiles (value) {
    this.#schemaLocaleFiles = value
  }

  /**
   * Get Settings Schema File
   * @return {string}
   */
  get settingsSchemaFile () {
    return this.#settingsSchemaFile
  }

  /**
   * Set Settings Schema File
   * @param {string} value
   */
  set settingsSchemaFile (value) {
    this.#settingsSchemaFile = value
  }

  /**
   * Get Snippet Files Object
   * #snippetFiles{snippetName: snippetFile}
   * @returns {string[]}
   */
  get snippetFiles () {
    return this.#snippetFiles
  }

  /**
   * Set Snippet Files Object
   * #snippetFiles{snippetName: snippetFile}
   * @param {string[]} value
   */
  set snippetFiles (value) {
    this.#snippetFiles = value
  }

  /**
   * Get Stylesheets' locations
   * @returns {string[]}
   */
  get stylesheets () {
    return this.#stylesheets
  }

  /**
   * Set Stylesheets' locations
   * @param {string[]} value
   */
  set stylesheets (value) {
    this.#stylesheets = value
  }
}

export default ComponentFiles
