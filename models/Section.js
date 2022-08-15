import Component from './abstract/Component.js'
import SectionFiles from './SectionFiles.js'

class Section extends Component {
  #build
  #files
  #renders

  constructor () {
    super()
    this.files = new SectionFiles()
  }

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

  /**
   * Get Renders
   * @returns {Render[]}
   */
  get renders () {
    return this.#renders
  }

  /**
   * Set Renders
   * @param {Render[]} value
   */
  set renders (value) {
    this.#renders = value
  }

}

export default Section
