class Build {
  #assetsFolder
  #localesFolder
  #rootFolder
  #snippetsFolder

  constructor (rootFolder) {
    this.rootFolder = rootFolder
  }

  /**
   * Get Build Assets Folder
   * @returns {string}
   */
  get assetsFolder () {
    if (!this.#assetsFolder && this.#rootFolder) {
      this.assetsFolder = `${this.rootFolder}/assets`
    }
    return this.#assetsFolder
  }

  /**
   * Set Build Assets Folder
   * @param {string} value
   */
  set assetsFolder (value) {
    this.#assetsFolder = value
  }

  /**
   * Get Build Locales Folder
   * @returns {string}
   */
  get localesFolder () {
    if (!this.#localesFolder && this.#rootFolder) {
      this.localesFolder = `${this.rootFolder}/locales`
    }
    return this.#localesFolder
  }

  /**
   * Set Build Locales Folder
   * @param {string} value
   */
  set localesFolder (value) {
    this.#localesFolder = value
  }

  /**
   * Get Build Root Folder
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
   * Get Build Snippets Folder
   * @returns {string}
   */
  get snippetsFolder () {
    if (!this.#snippetsFolder && this.#rootFolder) {
      this.snippetsFolder = `${this.rootFolder}/snippets`
    }
    return this.#snippetsFolder
  }

  /**
   * Set Build Snippets Folder
   * @param value
   */
  set snippetsFolder (value) {
    this.#snippetsFolder = value
  }
}

export default Build