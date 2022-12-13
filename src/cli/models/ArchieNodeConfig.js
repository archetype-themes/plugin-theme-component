import { dirname } from 'path'
import Collection from '../../models/Collection.js'
import Section from '../../models/Section.js'
import Snippet from '../../models/Snippet.js'
import Theme from '../../models/Theme.js'

class ArchieNodeConfig {
  /** @type {string}  **/
  static DEFAULT_PACKAGE_SCOPE = '@archetype-themes'

  /** @type {string[]}  **/
  static ALLOWED_COMPONENT_TYPES = [
    Collection.COMPONENT_NAME,
    Section.COMPONENT_NAME,
    Snippet.COMPONENT_NAME,
    Theme.COMPONENT_NAME]

  /** @type {string[]}  **/
  static #collections = []

  /** @type {string}  **/
  static #componentType

  static get componentType () {
    return this.#componentType
  }

  /** @type {number} **/
  static #gridSize

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
   * Get mixins config
   * @return {number}
   */
  static get gridSize () {
    return this.#gridSize
  }

  /**
   * Set mixins config
   * @param {number} value
   */
  static set gridSize (value) {
    this.#gridSize = value
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
    return this.#componentType === Theme.COMPONENT_NAME
  }

  static isCollection () {
    return this.#componentType === Collection.COMPONENT_NAME
  }

  static isSection () {
    return this.#componentType === Section.COMPONENT_NAME
  }

  static isSnippet () {
    return this.#componentType === Snippet.COMPONENT_NAME
  }

}

export default ArchieNodeConfig
