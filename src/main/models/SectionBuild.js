import ComponentBuild from './abstract/ComponentBuild.js'

class SectionBuild extends ComponentBuild {
  /** @type {string} **/
  #liquidCode

  /** @type {string} **/
  #liquidFile

  /** @type {SectionSchema} **/
  #schema

  /** @type {string} **/
  #stylesBundle

  /** @type {string} **/
  #stylesBundleFile

  /**
   * Get liquid code
   * @return {string}
   */
  get liquidCode () {
    return this.#liquidCode
  }

  /**
   * Set liquid code
   * @param {string} value
   */
  set liquidCode (value) {
    this.#liquidCode = value
  }

  /**
   * Get Liquid Build File Location
   * @returns {string}
   */
  get liquidFile () {
    return this.#liquidFile
  }

  /**
   * Set Liquid Build File Location
   * @param {string} value
   */
  set liquidFile (value) {
    this.#liquidFile = value
  }

  /**
   * Get Section schema
   * @return {SectionSchema}
   */
  get schema () {
    return this.#schema
  }

  /**
   * Set Section schema
   * @param {SectionSchema} value
   */
  set schema (value) {
    this.#schema = value
  }

  /**
   * Get styles bundle content
   * @return {string}
   */
  get stylesBundle () {
    return this.#stylesBundle
  }

  /**
   * Set styles bundle content
   * @param {string} value
   */
  set stylesBundle (value) {
    this.#stylesBundle = value
  }

  /**
   * Get styles bundle filename
   * @return {string}
   */
  get stylesBundleFile () {
    return this.#stylesBundleFile
  }

  /**
   * Set styles bundle filename
   * @param value
   */
  set stylesBundleFile (value) {
    this.#stylesBundleFile = value
  }
}

export default SectionBuild
