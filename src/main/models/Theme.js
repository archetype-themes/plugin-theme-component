class Theme {
  /** @type {string} **/
  #assetsFolder

  /** @type {string} **/
  #configFolder

  /** @type {string} **/
  #localesFolder

  /** @type {string} **/
  #name

  /** @type {string} **/
  #rootFolder

  /** @type {string} **/
  #sectionsFolder

  /** @type {string} **/
  #snippetsFolder

  /**
   * Get Assets Folder
   * @return {string}
   */
  get assetsFolder () {
    return this.#assetsFolder
  }

  /**
   * Set Assets Folder
   * @param {string} value
   */
  set assetsFolder (value) {
    this.#assetsFolder = value
  }

  /**
   * Get Config Folder
   * @return {string}
   */
  get configFolder () {
    return this.#configFolder
  }

  /**
   * Set Config Folder
   * @param {string} value
   */
  set configFolder (value) {
    this.#configFolder = value
  }

  /**
   * Get Locales Folder
   * @return {string}
   */
  get localesFolder () {
    return this.#localesFolder
  }

  /**
   * Set Locales Folder
   * @param {string} value
   */
  set localesFolder (value) {
    this.#localesFolder = value
  }

  /**
   * Get Name
   * @return {string}
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
   * @return {string}
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
   * Get Sections Folder
   * @return {string}
   */
  get sectionsFolder () {
    return this.#sectionsFolder
  }

  /**
   * Set Sections Folder
   * @param {string} value
   */
  set sectionsFolder (value) {
    this.#sectionsFolder = value
  }

  /**
   * Get Snippets Folder
   * @return {string}
   */
  get snippetsFolder () {
    return this.#snippetsFolder
  }

  /**
   * Set Snippets Folder
   * @param {string} value
   */
  set snippetsFolder (value) {
    this.#snippetsFolder = value
  }
}

export default Theme
