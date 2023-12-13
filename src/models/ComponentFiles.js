class ComponentFiles {
  /** @type {string[]} */
  #assetFiles = []

  /** @type {string[]}
   * @default **/
  #javascriptFiles = []

  /** @type {string} **/
  #javascriptIndex

  /** @type {string} **/
  #liquidFile

  /** @type {string} **/
  #mainStylesheet

  /** @type {string} **/
  #packageJson

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
   * Get path to the component's main liquid file
   * @returns {string}
   */
  get liquidFile () {
    return this.#liquidFile
  }

  /**
   * Set path to the component's main liquid file
   * @param {string} value
   */
  set liquidFile (value) {
    this.#liquidFile = value
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
