import { dirname } from 'path'
import ComponentsConfig from '../../config/ComponentsConfig.js'

/**
 * @typedef archie
 * @type {object}
 * @property {string} componentType - one of ALLOWED_COMPONENT_TYPES.
 */

class Config {

  /** @type {string[]}  **/
  static #collections = []

  /** @type {string}  **/
  static #componentType

  static get componentType () {
    return this.#componentType
  }

  static set componentType (value) {
    this.#componentType = value
  }

  static get collections () {
    return this.#collections
  }

  static set collections (value) {
    this.#collections = value
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
   * Get Archie Folder
   * @return {string}
   */
  static getArchieFolder () {
    return dirname(dirname(import.meta.url)).substring(7)
  }

  static isTheme () {
    return this.#componentType === ComponentsConfig.THEME_COMPONENT_TYPE
  }

  static isCollection () {
    return this.#componentType === ComponentsConfig.COLLECTION_COMPONENT_TYPE
  }

  static isSection () {
    return this.#componentType === ComponentsConfig.SECTION_COMPONENT_TYPE
  }

  static isSnippet () {
    return this.#componentType === ComponentsConfig.SNIPPET_COMPONENT_TYPE
  }

}

export default Config
