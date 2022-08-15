class Component {
  #liquidCode
  #name
  #rootFolder

  constructor () {
    if (new.target === Component) {
      throw new TypeError('Cannot construct Component instances directly')
    }
  }

  /**
   * Get Liquid Code
   * @returns {string}
   */
  get liquidCode () {
    return this.#liquidCode
  }

  /**
   * Liquid Code
   * @param {string} value
   */
  set liquidCode (value) {
    this.#liquidCode = value
  }

  /**
   * Get Name
   * @returns {string}
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
   * @returns {string}
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
}

export default Component
