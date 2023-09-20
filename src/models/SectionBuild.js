import ComponentBuild from './ComponentBuild.js'

class SectionBuild extends ComponentBuild {
  /** @type {string} **/
  #liquidCode

  /** @type {string} **/
  #liquidFile

  /** @type {SectionSchema} **/
  #schema

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
}

export default SectionBuild
