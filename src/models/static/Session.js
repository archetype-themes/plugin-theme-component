import {
  COLLECTION_TYPE_NAME,
  THEME_TYPE_NAME
} from '../../config/Components.js'

class Session {
  /** @type {ComponentTomlConfig} Plugin TOML config  **/
  static config

  /** @type {string} CLI Caller Component Type **/
  static callerType

  /** @type {string} Watcher ChangeType enum value **/
  static changeType

  /** @type {Object} Install command's collection names and child components list **/
  static collections

  /** @type {string[]} Target Component Name **/
  static components

  /** @type {string} Path to external components **/
  static componentsPath

  /** @type {string} Command Name  **/
  static command

  /** @type {string} Path to the dev theme **/
  static themePath

  /** @type {boolean} Indicates whether it is the first run. **/
  static firstRun = true

  /** @type {string} Path to the external locales library **/
  static localesPath

  /** @type {boolean}  Copy components' setup files or not **/
  static setupFiles

  /** @type {boolean} Run "shopify theme dev" in parallel to sync files with a local dev **/
  static syncMode = false

  /** @type {boolean} Watch for source file changes **/
  static watchMode = false

  /**
   * Is The Component Type a Collection
   * @return {boolean}
   */
  static isCollection() {
    return this.callerType === COLLECTION_TYPE_NAME
  }

  /**
   * Is The Component Type a Theme
   * @return {boolean}
   */
  static isTheme() {
    return this.callerType === THEME_TYPE_NAME
  }
}

export default Session
