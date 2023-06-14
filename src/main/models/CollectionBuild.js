class CollectionBuild {
  /** @type {string} **/
  #assetsFolder

  /** @type {string} **/
  #javascriptFile

  /** @type {string} **/
  #localesFolder

  /** @type {string} **/
  #rootFolder

  /** @type {Object} **/
  #schemaLocales = {}

  /** @type {string} **/
  #sectionsFolder

  /** @type {string} **/
  #snippetsFolder

  /** @type {string} **/
  #styles

  /** @type {string} **/
  #stylesheet

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
   * Get JavaScript Files
   * @return {string}
   */
  get javascriptFile () {
    return this.#javascriptFile
  }

  /**
   * Set JavaScript File
   * @param {string} value
   */
  set javascriptFile (value) {
    this.#javascriptFile = value
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

  /**
   * Get Styles
   * @return {string}
   */
  get styles () {
    return this.#styles
  }

  /**
   * Set Styles
   * @param {string} value
   */
  set styles (value) {
    this.#styles = value
  }

  /**
   * Get Stylesheet File Location
   * @return {string}
   */
  get stylesheet () {
    return this.#stylesheet
  }

  /**
   * Set Stylesheet File Location
   * @param {string} value
   */
  set stylesheet (value) {
    this.#stylesheet = value
  }
}

export default CollectionBuild
