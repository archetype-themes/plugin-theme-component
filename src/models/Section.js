import Component from './abstract/Component.js'

class Section extends Component {
  /** @type {string} **/
  static COMPONENT_NAME = 'section'

  /** @type {SectionBuild} **/
  #build
  /** @type {SectionFiles} **/
  #files

  /**
   *  Get Build
   * @returns {SectionBuild}
   */
  get build () {
    return this.#build
  }

  /**
   * Set Build
   * @param {SectionBuild} value
   */
  set build (value) {
    this.#build = value
  }

  /**
   * Get Files Model Reference
   * @returns {SectionFiles}
   */
  get files () {
    return this.#files
  }

  /**
   * Set Files Model Reference
   * @param {SectionFiles} value
   */
  set files (value) {
    this.#files = value
  }

}

export default Section
