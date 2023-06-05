/**
 * @typedef {Object} InputSetting
 * @property {string} type - The setting type, which can be any of the basic or specialized input setting types.
 * @property {string} id - The setting ID, which is used to access the setting value.
 * @property {string} label - The setting label, which will show in the theme editor.
 * @property {*} [default] - The default value for the setting.
 * @property {string} [info] - An option for informational text about the setting.
 * @see https://shopify.dev/themes/architecture/settings/input-settings
 */

/**
 * @typedef {Object} SidebarSetting
 * @property {string} type - The input setting type, which can be either header or paragraph.
 * @property {string} content - The setting content, which will show in the theme editor.
 * @see https://shopify.dev/themes/architecture/settings/sidebar-settings
 */

/**
 * @typedef {Object} Block
 * @property {string} type - The block type. This is a free-form string that you can use as an identifier.
 * @property {string} name - The block name, which will show as the block title in the theme editor.
 * @property {number} [limit] - The number of blocks of this type that can be used.
 * @property {Object} [settings] - Any input or sidebar settings that you want for the block.
 * @see  https://shopify.dev/themes/architecture/sections/section-schema#blocks
 */

/**
 * @typedef {Object.<string, string>} SettingPreset
 *
 * @typedef {Object} BlockPreset
 * @property {string} type
 * @property {SettingPreset} settings
 *
 *
 * @typedef {Object} Preset
 * @property {string} name - The preset name, which will show in the Add section portion of the theme editor.
 * @property {SettingPreset} [settings] - A list of default values for any settings you might want to populate.
 * @property {BlockPreset} [blocks] - A list of default blocks that you might want to include.
 * @see https://shopify.dev/themes/architecture/sections/section-schema#presets
 */

/**
 * Class representing a Section Schema as per Shopify's Documentation
 * @see https://shopify.dev/themes/architecture/sections/section-schema
 */
class SectionSchema {
  static SECTION_SCHEMA_PROPERTIES = ['name',
    'tag',
    'class',
    'limit',
    'settings',
    'blocks',
    'max_blocks',
    'presets',
    'default',
    'locales',
    'templates']

  /** @type {string} **/
  #name

  /** @type {string} **/
  #tag

  /** @type {string} **/
  #class

  /** @type {number} **/
  #limit

  /** @type {Array.<InputSetting|SidebarSetting>} **/
  #settings

  /** @type {Block[]} **/
  #blocks

  /** @type {number} **/
  #max_blocks

  /** @type {Preset[]} **/
  #presets

  /** @type {Preset} **/
  #default

  /** @type {Object} **/
  #locales

  /** @type {string[]} **/
  #templates

  /**
   * Get name
   * @return {string}
   */
  get name () {
    return this.#name
  }

  /**
   * Set name
   * @param {string} value
   */
  set name (value) {
    this.#name = value
  }

  /**
   * Get tag name
   * @return {string}
   */
  get tag () {
    return this.#tag
  }

  /**
   * Set tag name
   * @param {string} value
   */
  set tag (value) {
    this.#tag = value
  }

  /**
   * Get class name
   * @return {string}
   */
  get class () {
    return this.#class
  }

  /**
   * Set class name
   * @param {string} value
   */
  set class (value) {
    this.#class = value
  }

  /**
   * Get limit
   * @return {number}
   */
  get limit () {
    return this.#limit
  }

  /**
   * Set limit
   * @param {number} value
   */
  set limit (value) {
    this.#limit = value
  }

  /**
   * Get settings
   * @return {Array<InputSetting|SidebarSetting>}
   */
  get settings () {
    return this.#settings
  }

  /**
   * Set settings
   * @param {Array<InputSetting|SidebarSetting>} value
   */
  set settings (value) {
    this.#settings = value
  }

  /**
   * Get blocks
   * @return {Block[]}
   */
  get blocks () {
    return this.#blocks
  }

  /**
   * Set blocks
   * @param {Block[]} value
   */
  set blocks (value) {
    this.#blocks = value
  }

  /**
   * Get max blocks
   * @return {number}
   */
  get max_blocks () {
    return this.#max_blocks
  }

  /**
   * Set max blocks
   * @param {number} value
   */
  set max_blocks (value) {
    this.#max_blocks = value
  }

  /**
   * Get presets
   * @return {Preset[]}
   */
  get presets () {
    return this.#presets
  }

  /**
   *Set presets
   * @param {Preset[]} value
   */
  set presets (value) {
    this.#presets = value
  }

  /**
   * Get default
   * @return {Preset}
   */
  get default () {
    return this.#default
  }

  /**
   *Set default
   * @param {Preset} value
   */
  set default (value) {
    this.#default = value
  }

  /**
   * Get locales
   * @return {Object}
   */
  get locales () {
    return this.#locales
  }

  /**
   * Set locales
   * @param {Object} value
   */
  set locales (value) {
    this.#locales = value
  }

  /**
   * Get templates
   * @return {string[]}
   */
  get templates () {
    return this.#templates
  }

  /**
   * Set templates
   * @param {string[]} value
   */
  set templates (value) {
    this.#templates = value
  }

  toJSON () {
    const jsonObject = {}
    for (const property of SectionSchema.SECTION_SCHEMA_PROPERTIES) {
      jsonObject[property] = this[property]
    }

    return jsonObject
  }
}

export default SectionSchema
