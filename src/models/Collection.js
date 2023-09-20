/** @module models/Collection */
class Collection {
  /** @type {CollectionBuild} **/
  #build

  /** @type {string} **/
  #name

  /** @type {string} **/
  #rootFolder

  /** @type {string[]} **/
  #componentsFolders

  /** @type {string[]} **/
  #sectionNames

  /** @type {Section[]} **/
  #sections

  /** @type {boolean} **/
  #prefixStorefrontLocales

  constructor () {
    this.sectionNames = []
    this.sections = []
  }

  /**
   * Get Collection Build
   * @return {CollectionBuild}
   */
  get build () {
    return this.#build
  }

  /**
   * Set Collection Build
   * @param {CollectionBuild} value
   */
  set build (value) {
    this.#build = value
  }

  /**
   * Get name
   * @return {string}
   */
  get name () {
    return this.#name
  }

  /**
   * Set name
   * @param {string} value
   */
  set name (value) {
    this.#name = value
  }

  /**
   * Get root folder
   * @return {string}
   */
  get rootFolder () {
    return this.#rootFolder
  }

  /**
   * Set root folder
   * @param {string} value
   */
  set rootFolder (value) {
    this.#rootFolder = value
  }

  /**
   * Get Components Folders
   * @returns {string[]}
   */
  get componentsFolders () {
    return this.#componentsFolders
  }

  /**
   * Set Components Folders
   * @param {string[]} value
   */
  set componentsFolders (value) {
    this.#componentsFolders = value
  }

  /**
   * Get section names
   * @return {string[]}
   */
  get sectionNames () {
    return this.#sectionNames
  }

  /**
   * Set section names
   * @param {string[]} value
   */
  set sectionNames (value) {
    this.#sectionNames = value
  }

  /**
   * Get sections
   * @return {Section[]}
   */
  get sections () {
    return this.#sections
  }

  /**
   * Set sections
   * @param value
   */
  set sections (value) {
    this.#sections = value
  }

  /**
   * Get Prefix Storefront Locales
   * @returns {boolean}
   */
  get prefixStorefrontLocales () {
    return this.#prefixStorefrontLocales
  }

  /**
   * Set Prefix Storefront Locales
   * @param {boolean} value
   */
  set prefixStorefrontLocales (value) {
    this.#prefixStorefrontLocales = value
  }
}

export default Collection
