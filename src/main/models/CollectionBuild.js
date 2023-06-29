import ComponentBuild from './abstract/ComponentBuild.js'

class CollectionBuild extends ComponentBuild {
  /** @type {string} **/
  #sectionsFolder

  /**
   * Get Sections Folder
   * @return {string}
   */
  get sectionsFolder () {
    return this.#sectionsFolder
  }

  /**
   * Set Sections Folder
   * @param {string} value
   */
  set sectionsFolder (value) {
    this.#sectionsFolder = value
  }
}

export default CollectionBuild
