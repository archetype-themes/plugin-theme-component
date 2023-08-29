import AbstractClassInstantiationError from '../../../errors/AbstractClassInstantiationError.js'

class Component {
  /** @type {string} **/
  #liquidCode

  /** @type {Object } **/
  #locales = {}

  /** @type {string} **/
  #name

  /** @type {string} **/
  #rootFolder

  /** @type {SectionSchema} **/
  #schema

  /** @type {Object} **/
  #schemaLocales = {}

  /** @type {Object[]} **/
  #settingsSchema

  /** @type {Snippet[]} **/
  #snippets = []

  constructor () {
    if (new.target === Component) {
      throw new AbstractClassInstantiationError('Cannot construct Component instances directly. It is meant to be used as an abstract class.')
    }
  }

  /**
   * Get Liquid Code
   * @returns {string}
   */
  get liquidCode () {
    return this.#liquidCode
  }

  /**
   * Liquid Code
   * @param {string} value
   */
  set liquidCode (value) {
    this.#liquidCode = value
  }

  /**
   * Get Locales
   * @return {Object}
   */
  get locales () {
    return this.#locales
  }

  /**
   * Set Locales
   * @param {Object} value
   */
  set locales (value) {
    this.#locales = value
  }

  /**
   * Get Name
   * @returns {string}
   */
  get name () {
    return this.#name
  }

  /**
   * Set Name
   * @param {string} value
   */
  set name (value) {
    this.#name = value
  }

  /**
   * Get Root Folder
   * @returns {string}
   */
  get rootFolder () {
    return this.#rootFolder
  }

  /**
   * Set Root Folder
   * @param {string} value
   */
  set rootFolder (value) {
    this.#rootFolder = value
  }

  /**
   * Get Schema Object Representation
   * @returns {SectionSchema}
   */
  get schema () {
    return this.#schema
  }

  /**
   * Get Schema Object Representation
   * @param {SectionSchema} value
   */
  set schema (value) {
    this.#schema = value
  }

  /**
   * Get Schema Locales
   * @return {Object}
   */
  get schemaLocales () {
    return this.#schemaLocales
  }

  /**
   * Set Schema Locales
   * @param {Object} value
   */
  set schemaLocales (value) {
    this.#schemaLocales = value
  }

  /**
   * Get Settings Schema
   * @return {Object[]}
   */
  get settingsSchema () {
    return this.#settingsSchema
  }

  /**
   * Set Settings Schema
   * @param {Object[]} value
   */
  set settingsSchema (value) {
    this.#settingsSchema = value
  }

  /**
   * Get Snippets
   * @returns {Snippet[]}
   */
  get snippets () {
    return this.#snippets
  }

  /**
   * Set Snippets
   * @param {Snippet[]} value
   */
  set snippets (value) {
    this.#snippets = value
  }
}

export default Component
