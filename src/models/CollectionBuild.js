class CollectionBuild {
  /** @type {string} **/
  #assetsFolder

  /** @type {string} **/
  #localesFolder

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

export default CollectionBuild
