class ComponentBuild {
  /** @type {string} **/
  #assetsFolder

  /** @type {string} **/
  #javascriptFile

  /** @type {string} **/
  #liquidCode

  /** @type {string} **/
  #liquidFile

  /** @type {string} **/
  #localesFolder

  /** @type {string} **/
  #rootFolder

  /** @type {string} **/
  #styles

  /** @type {string} **/
  #stylesBundle

  /** @type {string} **/
  #stylesBundleFile

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
   * Get build styles
   * @return {string}
   */
  get styles () {
    return this.#styles
  }

  /**
   * Set build styles
   * @param {string} value
   */
  set styles (value) {
    this.#styles = value
  }

  /**
   * Get styles bundle content
   * @return {string}
   */
  get stylesBundle () {
    return this.#stylesBundle
  }

  /**
   * Set styles bundle content
   * @param {string} value
   */
  set stylesBundle (value) {
    this.#stylesBundle = value
  }

  /**
   * Get styles bundle filename
   * @return {string}
   */
  get stylesBundleFile () {
    return this.#stylesBundleFile
  }

  /**
   * Set styles bundle filename
   * @param value
   */
  set stylesBundleFile (value) {
    this.#stylesBundleFile = value
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
