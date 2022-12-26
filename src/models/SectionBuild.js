import ComponentBuild from './abstract/ComponentBuild.js'

class SectionBuild extends ComponentBuild {
  /** @type {SectionSchema} **/
  #schema

  /** @type {string} **/
  #snippetsFolder

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
   * Get Build Snippets Folder
   * @returns {string}
   */
  get snippetsFolder () {
    return this.#snippetsFolder
  }

  /**
   * Set Build Snippets Folder
   * @param {string} value
   */
  set snippetsFolder (value) {
    this.#snippetsFolder = value
  }
}

export default SectionBuild
