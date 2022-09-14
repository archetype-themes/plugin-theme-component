class Collection {
  /** @type {string} **/
  #name

  /** @type {string} **/
  #rootFolder

  /** @type {string[]} **/
  #sectionNames

  /** @type {Section[]} **/
  #sections

  /** @type {string} **/
  #sectionsFolder

  constructor () {
    this.sectionNames = []
    this.sections = []
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
   * Get sections folder
   * @return {string}
   */
  get sectionsFolder () {
    return this.#sectionsFolder
  }

  /**
   * Set sections folder
   * @param {string} value
   */
  set sectionsFolder (value) {
    this.#sectionsFolder = value
  }
}

export default Collection
