/** @module models/Collection */
class Collection {
  /** @type {CollectionBuild} **/
  #build

  /** @type {string} **/
  #name

  /** @type {string} **/
  #rootFolder

  /** @type {Component[]} **/
  #components

  /** @type {string | undefined} **/
  #gitIgnoreFile

  /** @type {string[]} **/
  #packageJsonFiles

  /** @type {string[]} **/
  #componentNames

  /** @type {Section[]} **/
  #sections

  /** @type {Snippet[]} **/
  #snippets

  /** @type {Map<string, string> | undefined} **/
  #importMapEntries

  constructor () {
    this.componentNames = []
    this.components = []
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
   * Get Components
   * @returns {Component[]}
   */
  get components () {
    return this.#components
  }

  /**
   * Set Components
   * @param {Component[]} value
   */
  set components (value) {
    this.#components = value
  }

  /**
   * Get gitignore file list
   * @returns {string | undefined}
   */
  get gitIgnoreFile () {
    return this.#gitIgnoreFile
  }

  /**
   * Set gitignore file list
   * @param {string | undefined} value
   */
  set gitIgnoreFile (value) {
    this.#gitIgnoreFile = value
  }

  /**
   * Get package.json file list
   * @returns {string[]}
   */
  get packageJsonFiles () {
    return this.#packageJsonFiles
  }

  /**
   * Set package.json file list
   * @param {string[]} value
   */
  set packageJsonFiles (value) {
    this.#packageJsonFiles = value
  }

  /**
   * Get section names
   * @return {string[]}
   */
  get componentNames () {
    return this.#componentNames
  }

  /**
   * Set section names
   * @param {string[]} value
   */
  set componentNames (value) {
    this.#componentNames = value
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
   * Get Snippets
   * @returns {Snippet[]}
   */
  get snippets () {
    return this.#snippets
  }

  /**
   * Set Snippets
   * @param {Snippet[]} value
   */
  set snippets (value) {
    this.#snippets = value
  }

  get importMapEntries () {
    return this.#importMapEntries
  }

  set importMapEntries (value) {
    this.#importMapEntries = value
  }
}

export default Collection
