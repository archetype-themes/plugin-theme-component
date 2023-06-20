import Components from '../../config/Components.js'

class NodeConfig {
  /** @type {string[]}  **/
  static #collections = []

  /** @type {string}  **/
  static #componentType

  /** @type {string}  **/
  static #componentPath

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
   * Get Component Type
   * @return {string}
   */
  static get componentType () {
    return this.#componentType
  }

  /**
   * Set Component Type
   * @param value
   */
  static set componentType (value) {
    this.#componentType = value
  }

  /**
   * Get Collection Sections List
   * @param collectionName
   * @return {string[]}
   */
  static getCollectionSections (collectionName) {
    return this.collections[collectionName] ? this.collections[collectionName] : []
  }

  /**
   * Is The Component Type a Theme
   * @return {boolean}
   */
  static isTheme () {
    return this.#componentType === Components.THEME_COMPONENT_NAME
  }

  /**
   * Is The Component Type a Collection
   * @return {boolean}
   */
  static isCollection () {
    return this.#componentType === Components.COLLECTION_COMPONENT_NAME
  }

  /**
   * Is The Component Type a Section
   * @return {boolean}
   */
  static isSection () {
    return this.#componentType === Components.SECTION_COMPONENT_NAME
  }

  /**
   * Is The Component Type a Snippet
   * @return {boolean}
   */
  static isSnippet () {
    return this.#componentType === Components.SNIPPET_COMPONENT_NAME
  }
}

export default NodeConfig
