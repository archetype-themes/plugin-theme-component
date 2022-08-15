import Component from './abstract/Component.js'
import SectionFiles from './SectionFiles.js'

class Section extends Component {
  #files
  #renders

  constructor () {
    super()
    this.files = new SectionFiles()
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
