import Components from '../../config/Components.js'

/**
 * @typedef CLIConfig
 * @type {Object}
 * @property {string} type - Component type (theme/collection/component)
 * @property {string} path - Component path (ie: './src')
 * FOR THEMES ONLY
 * @property {Object.<string, string[]>} collections - In Collection mode, list of components to build.
 * FOR COLLECTIONS ONLY
 * @property {string} components - List of components to build.
 * @property {string|string[]} componentFolders - Path to components
 **/

class Session {
  /** @type {CLIConfig}  **/
  static #config

  /** @type {string} CLI Caller Component Type **/
  static #callerType

  /** @type {string}  **/
  static #command

  /** @type {string}  **/
  static #devTheme

  /** @type {string}  **/
  static #localesRepo

  /** @type {string|Object}  **/
  static #targets

  /** @type {string}  **/
  static #targetType

  /** @type {boolean}  **/
  static #watchMode = false

  /**
   * Get CLI Config
   * @returns {CLIConfig}
   */
  static get config () {
    return this.#config
  }

  /**
   * Set CLI Config
   * @param {CLIConfig} value
   */
  static set config (value) {
    this.#config = value
  }

  /**
   * Get CLI Caller Component Type
   * @returns {string}
   */
  static get callerType () {
    return this.#callerType
  }

  /**
   * Set CLI Caller Component Type
   * @param {string} value
   */
  static set callerType (value) {
    this.#callerType = value
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
   * Get Dev Theme URL
   * @returns {string}
   */
  static get devTheme () {
    return this.#devTheme
  }

  /**
   * Set Dev Theme URL
   * @param {string} value
   */
  static set devTheme (value) {
    this.#devTheme = value
  }

  /**
   * Get localesRepo URL
   * @returns {string}
   */
  static get localesRepo () {
    return this.#localesRepo
  }

  /**
   * Set localesRepo URL
   * @param {string} value
   */
  static set localesRepo (value) {
    this.#localesRepo = value
  }

  /**
   * Get Command Option
   * @return {string}
   */
  static get targetType () {
    return this.#targetType
  }

  /**
   * Set Command Option
   * @param {string} value
   */
  static set targetType (value) {
    this.#targetType = value
  }

  /**
   * Get Target Component Name
   * @return {string|Object}
   */
  static get targets () {
    return this.#targets
  }

  /**
   * Set Target Component Name
   * @param {string|Object} value
   */
  static set targets (value) {
    this.#targets = value
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
    return this.#callerType === Components.COLLECTION_TYPE_NAME
  }

  /**
   * Is The CLI Caller Of A Component Type
   * @return {boolean}
   */
  static isComponent () {
    return this.#callerType === Components.COMPONENT_TYPE_NAME
  }

  /**
   * Is The Component Type a Theme
   * @return {boolean}
   */
  static isTheme () {
    return this.#callerType === Components.THEME_TYPE_NAME
  }
}

export default Session
