import ComponentBuild from './ComponentBuild.js'

class CollectionBuild extends ComponentBuild {
  /** @type {string} **/
  #assetsFolder

  /** @type {string} **/
  #configFolder

  /** @type {string} **/
  #javascriptFile

  /** @type {string} **/
  #localesFolder

  /** @type {string} **/
  #rootFolder

  /** @type {string} **/
  #sectionsFolder

  /** @type {string} **/
  #importMapFile

  /** @type {string} **/
  #snippetsFolder

  /** @type {string} **/
  #styles

  /** @type {string} **/
  #stylesheet

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
   * Get Build Snippets Folder
   * @returns {string}
   */
  get snippetsFolder () {
    return this.#snippetsFolder
  }

  /**
   * Set Build Snippets Folder
   * @param {string} value
   */
  set snippetsFolder (value) {
    this.#snippetsFolder = value
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

  /**
   * Get Import Map File Location
   */
  get importMapFile () {
    return this.#importMapFile
  }

  /**
   * Set Import Map File Location
   */
  set importMapFile (value) {
    this.#importMapFile = value
  }
}

export default CollectionBuild
