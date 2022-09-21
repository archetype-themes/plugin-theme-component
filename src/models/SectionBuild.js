import ComponentBuild from './abstract/ComponentBuild.js'

class SectionBuild extends ComponentBuild {
  /** @type {string} **/
  #snippetsFolder

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
