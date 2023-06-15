import AbstractClassInstantiationError from '../../../errors/AbstractClassInstantiationError.js'

class ComponentBuild {
  /** @type {string} **/
  #assetsFolder

  /** @type {string} **/
  #configFolder

  /** @type {string} **/
  #javascriptFile

  /** @type {string} **/
  #localesFolder

  /** @type {string} **/
  #rootFolder

  /** @type {Object} **/
  #schemaLocales

  /** @type {Object} **/
  #settingsSchema

  /** @type {string} **/
  #settingsSchemaFile

  /** @type {string} **/
  #snippetsFolder

  /** @type {string} **/
  #styles

  /** @type {string} **/
  #stylesheet

  constructor () {
    if (new.target === ComponentBuild) {
      throw new AbstractClassInstantiationError('Cannot construct ComponentBuild instances directly. It is meant to be used as an abstract class.')
    }
  }

  /**
   * Get Assets Build Folder Location
   * @returns {string}
   */
  get assetsFolder () {
    return this.#assetsFolder
  }

  /**
   * Set Assets Build Folder Location
   * @param {string} value
   */
  set assetsFolder (value) {
    this.#assetsFolder = value
  }

  /**
   * Get Config Folder
   * @return {string}
   */
  get configFolder () {
    return this.#configFolder
  }

  /**
   * Set Config Folder
   * @param {string} value
   */
  set configFolder (value) {
    this.#configFolder = value
  }

  /**
   * Get Javascript Build File Location
   * @returns {string}
   */
  get javascriptFile () {
    return this.#javascriptFile
  }

  /**
   *Set Javascript Build File Location
   * @param {string} value
   */
  set javascriptFile (value) {
    this.#javascriptFile = value
  }

  /**
   * Get Locales Build Folder Location
   * @returns {string}
   */
  get localesFolder () {
    return this.#localesFolder
  }

  /**
   * Set Locales Build Folder Location
   * @param {string} value
   */
  set localesFolder (value) {
    this.#localesFolder = value
  }

  /**
   * Get Root Build Folder Location
   * @returns {string}
   */
  get rootFolder () {
    return this.#rootFolder
  }

  /**
   * Set Build Root Folder
   * @param {string} value
   */
  set rootFolder (value) {
    this.#rootFolder = value
  }

  /**
   * Get Schema Locales
   * @return {Object}
   */
  get schemaLocales () {
    return this.#schemaLocales
  }

  /**
   * Set Schema locales
   * @param {Object} value
   */
  set schemaLocales (value) {
    this.#schemaLocales = value
  }

  /**
   * Get Settings Schema
   * @return {Object}
   */
  get settingsSchema () {
    return this.#settingsSchema
  }

  /**
   * Set Settings Schema
   * @param {Object} value
   */
  set settingsSchema (value) {
    this.#settingsSchema = value
  }

  /**
   * Get Settings Schema File
   * @return {string}
   */
  get settingsSchemaFile () {
    return this.#settingsSchemaFile
  }

  /**
   * Set Settings Schema File
   * @param {string} value
   */
  set settingsSchemaFile (value) {
    this.#settingsSchemaFile = value
  }

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

  /**
   * Get build styles
   * @return {string}
   */
  get styles () {
    return this.#styles
  }

  /**
   * Set build styles
   * @param {string} value
   */
  set styles (value) {
    this.#styles = value
  }

  /**
   * Get Stylesheet Build File Location
   * @returns {string}
   */
  get stylesheet () {
    return this.#stylesheet
  }

  /**
   * Set Stylesheet Build File Location
   * @param {string} value
   */
  set stylesheet (value) {
    this.#stylesheet = value
  }
}

export default ComponentBuild
