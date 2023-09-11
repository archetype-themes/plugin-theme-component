class NodeConfig {
  /** @type {string[]}  **/
  static #collections = []

  /** @type {string}  **/
  static #componentPath

  /** @type {boolean}  **/
  static #embedLocales = false

  /**
   * Get Collections
   * @return {string[]}
   */
  static get collections () {
    return this.#collections
  }

  /**
   * Set Collections
   * @param {string[]} value
   */
  static set collections (value) {
    this.#collections = value
  }

  /**
   * Get Component Path
   * @return {string}
   */
  static get componentPath () {
    return this.#componentPath
  }

  /**
   * Set Component Path
   * @param value
   */
  static set componentPath (value) {
    this.#componentPath = value
  }

  /**
   * Get Embed Locales option boolean value
   * @returns {boolean}
   */
  static get embedLocales () {
    return this.#embedLocales
  }

  /**
   * Set Embed Locales option boolean value
   * @param {boolean} value
   */
  static set embedLocales (value) {
    this.#embedLocales = value
  }

  /**
   * Get Collection Sections List
   * @param collectionName
   * @return {string[]}
   */
  static getCollectionSections (collectionName) {
    return this.collections[collectionName] ? this.collections[collectionName] : []
  }
}

export default NodeConfig
