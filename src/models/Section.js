import Component from './abstract/Component.js'

class Section extends Component {
  /** @type {string} **/
  static COMPONENT_NAME = 'section'

  /**
   * @override
   * @type {SectionBuild}
   */
  #build

  /**
   * @override
   * @type {SectionFiles}
   */
  #files

  /**
   *  Get Build
   * @override
   * @returns {SectionBuild}
   */
  get build () {
    return this.#build
  }

  /**
   * Set Build
   * @override
   * @param {SectionBuild} value
   */
  set build (value) {
    this.#build = value
  }

  /**
   * Get Files Model Reference
   * @override
   * @returns {SectionFiles}
   */
  get files () {
    return this.#files
  }

  /**
   * Set Files Model Reference
   * @override
   * @param {SectionFiles} value
   */
  set files (value) {
    this.#files = value
  }

}

export default Section
