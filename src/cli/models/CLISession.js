class CLISession {
  /** @type {boolean}  **/
  static #backupMode = false

  /** @type {string}  **/
  static #command

  /** @type {string}  **/
  static #commandOption

  /** @type {string|Object}  **/
  static #targetComponentName

  /** @type {boolean}  **/
  static #watchMode = false

  /**
   * Get Backup Mode
   * @return {boolean}
   */
  static get backupMode () {
    return this.#backupMode
  }

  /**
   * Set Backup Mode
   * @param {boolean} value
   */
  static set backupMode (value) {
    this.#backupMode = value
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
}

export default CLISession
