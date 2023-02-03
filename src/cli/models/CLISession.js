class CLISession {
  /** @type {string}  **/
  static #command

  /** @type {string}  **/
  static #commandOption

  /** @type {string|Object}  **/
  static #targetComponent

  /** @type {boolean}  **/
  static #watchMode = false

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
   * Get Target Component Name
   * @return {string|Object}
   */
  static get targetComponentName () {
    return this.#targetComponent
  }

  /**
   * Set Target Component Name
   * @param {string|Object} value
   */
  static set targetComponentName (value) {
    this.#targetComponent = value
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
}

export default CLISession
