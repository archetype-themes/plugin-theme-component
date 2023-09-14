import Components from '../../config/Components.js'

class CLISession {
  /** @type {object}  **/
  static #archieConfig

  /** @type {string}  **/
  static #command

  /** @type {string}  **/
  static #commandOption

  /** @type {string}  **/
  static #componentType

  /** @type {string|Object}  **/
  static #targetComponentName

  /** @type {boolean}  **/
  static #watchMode = false

  /**
   * Get Archie Config
   * @returns {Object}
   */
  static get archieConfig () {
    return this.#archieConfig
  }

  /**
   * Set Archie Config
   * @param {Object} value
   */
  static set archieConfig (value) {
    this.#archieConfig = value
  }

  /**
   * Get Command Name
   * @return {string}
   */
  static get command () {
    return this.#command
  }

  /**
   * Set Command Name
   * @param {string} value
   */
  static set command (value) {
    this.#command = value
  }

  /**
   * Get Command Option
   * @return {string}
   */
  static get commandOption () {
    return this.#commandOption
  }

  /**
   * Set Command Option
   * @param {string} value
   */
  static set commandOption (value) {
    this.#commandOption = value
  }

  /**
   * Get Component Type
   * @returns {string}
   */
  static get componentType () {
    return this.#componentType
  }

  /**
   * Set Component Type
   * @param {string} value
   */
  static set componentType (value) {
    this.#componentType = value
  }

  /**
   * Get Target Component Name
   * @return {string|Object}
   */
  static get targetComponentName () {
    return this.#targetComponentName
  }

  /**
   * Set Target Component Name
   * @param {string|Object} value
   */
  static set targetComponentName (value) {
    this.#targetComponentName = value
  }

  /**
   * Get Watch Mode
   * @return {boolean}
   */
  static get watchMode () {
    return this.#watchMode
  }

  /**
   * Set Watch Mode
   * @param {boolean} value
   */
  static set watchMode (value) {
    this.#watchMode = value
  }

  /**
   * Is The Component Type a Collection
   * @return {boolean}
   */
  static isCollection () {
    return this.#componentType === Components.COLLECTION_COMPONENT_NAME
  }

  /**
   * Is The Component Type a Section
   * @return {boolean}
   */
  static isSection () {
    return this.#componentType === Components.SECTION_COMPONENT_NAME
  }

  /**
   * Is The Component Type a Theme
   * @return {boolean}
   */
  static isTheme () {
    return this.#componentType === Components.THEME_COMPONENT_NAME
  }

  /**
   * Is Watch Mode Enabled
   * @return {boolean}
   */
  isWatchMode () {
    return this.#watchMode
  }
}

export default CLISession
