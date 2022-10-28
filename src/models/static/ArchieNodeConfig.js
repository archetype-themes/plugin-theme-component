import { dirname } from 'path'
import ArchieComponents from '../../config/ArchieComponents.js'

/**
 * @typedef archie
 * @type {object}
 * @property {string} componentType - one of  NODE_CONFIG_ALLOWED_COMPONENT_TYPES
 */

class ArchieNodeConfig {

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
    return this.#componentType === ArchieComponents.THEME_COMPONENT_TYPE
  }

  static isCollection () {
    return this.#componentType === ArchieComponents.COLLECTION_COMPONENT_TYPE
  }

  static isSection () {
    return this.#componentType === ArchieComponents.SECTION_COMPONENT_TYPE
  }

  static isSnippet () {
    return this.#componentType === ArchieComponents.SNIPPET_COMPONENT_TYPE
  }

}

export default ArchieNodeConfig
