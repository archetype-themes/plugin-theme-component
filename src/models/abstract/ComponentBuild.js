class ComponentBuild {
  /** @type {string} **/
  #assetsFolder

  /** @type {string} **/
  #javascriptFile

  /** @type {string} **/
  #liquidFile

  /** @type {string} **/
  #localesFolder

  /** @type {string} **/
  #rootFolder

  /** @type {string} **/
  #stylesheet

  constructor () {
    if (new.target === ComponentBuild) {
      throw new TypeError('Cannot construct ComponentBuild instances directly')
    }
  }

  /**
   * Get Assets Build Folder Location
   * @returns {string}
   */
  get assetsFolder () {
    return this.#assetsFolder
  }

  /**
   * Set Assets Build Folder Location
   * @param {string} value
   */
  set assetsFolder (value) {
    this.#assetsFolder = value
  }

  /**
   * Get Javascript Build File Location
   * @returns {string}
   */
  get javascriptFile () {
    return this.#javascriptFile
  }

  /**
   *Set Javascript Build File Location
   * @param {string} value
   */
  set javascriptFile (value) {
    this.#javascriptFile = value
  }

  /**
   * Get Liquid Build File Location
   * @returns {string}
   */
  get liquidFile () {
    return this.#liquidFile
  }

  /**
   * Set Liquid Build File Location
   * @param {string} value
   */
  set liquidFile (value) {
    this.#liquidFile = value
  }

  /**
   * Get Locales Build Folder Location
   * @returns {string}
   */
  get localesFolder () {
    return this.#localesFolder
  }

  /**
   * Set Locales Build Folder Location
   * @param {string} value
   */
  set localesFolder (value) {
    this.#localesFolder = value
  }

  /**
   * Get Root Build Folder Location
   * @returns {string}
   */
  get rootFolder () {
    return this.#rootFolder
  }

  /**
   * Set Build Root Folder
   * @param {string} value
   */
  set rootFolder (value) {
    this.#rootFolder = value
  }

  /**
   * Get Stylesheet Build File Location
   * @returns {string}
   */
  get stylesheet () {
    return this.#stylesheet
  }

  /**
   * Set Stylesheet Build File Location
   * @param {string} value
   */
  set stylesheet (value) {
    this.#stylesheet = value
  }
}

export default ComponentBuild
