import { dirname } from 'path'
import Collection from '../../models/Collection.js'
import Section from '../../models/Section.js'
import Snippet from '../../models/Snippet.js'
import Theme from '../../models/Theme.js'

/** @typedef {Object} MixinsConfig
 * @property {number} grid
 * @property {Object<string,number>} bp
 * @property {Object<string,string>} bpHolder
 * @property {string} bodyClasses
 * @property {string} bodyClassList
 * @property {string} filterTagHolder
 * @property {string} filterTags
 */
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

  /** @type {MixinsConfig} **/
  static #mixins

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
   * @return {MixinsConfig}
   */
  static get mixins () {
    return this.#mixins
  }

  /**
   * Set mixins config
   * @param {MixinsConfig} value
   */
  static set mixins (value) {
    this.#mixins = value
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
