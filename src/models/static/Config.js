import NodeUtils from '../../utils/NodeUtils.js'
import { dirname } from 'path'

/**
 * @typedef archie
 * @type {object}
 * @property {string} componentType - one of ALLOWED_COMPONENT_TYPES.
 */

class Config {
  static PACKAGES_SCOPE = '@archetype-themes'
  // Collection Sub-Folders
  static COLLECTION_ASSETS_SUBFOLDER = 'assets'
  static COLLECTION_SECTIONS_SUBFOLDER = 'sections'
  static COLLECTION_SNIPPETS_SUBFOLDER = 'snippets'
  // Component Types
  static COLLECTION_COMPONENT_TYPE = 'collection'
  static SECTION_COMPONENT_TYPE = 'section'
  static SNIPPET_COMPONENT_TYPE = 'snippet'
  static THEME_COMPONENT_TYPE = 'theme'

  static ALLOWED_COMPONENT_TYPES = [
    Config.COLLECTION_COMPONENT_TYPE,
    Config.SECTION_COMPONENT_TYPE,
    Config.SNIPPET_COMPONENT_TYPE,
    Config.THEME_COMPONENT_TYPE]

  /** @type {string}  **/
  static #componentType

  static get componentType () {
    return this.#componentType
  }

  static set componentType (value) {
    this.#componentType = value
  }

  /**
   * Get Collection Sections List
   * @param collectionName
   * @return {Promise<string[]>}
   */
  static async getSectionsList (collectionName) {
    const packageJson = await NodeUtils.getPackageJson()

    if (!packageJson.archie || !packageJson.archie[collectionName]) {
      return []
    }
    return packageJson.archie[collectionName]
  }

  /**
   * Get Archie Folder
   * @return {string}
   */
  static getArchieFolder () {
    return dirname(dirname(import.meta.url)).substring(7)
  }

  static isTheme () {
    return this.#componentType === this.THEME_COMPONENT_TYPE
  }

  static isCollection () {
    return this.#componentType === this.COLLECTION_COMPONENT_TYPE
  }

  static isSection () {
    return this.#componentType === this.SECTION_COMPONENT_TYPE
  }

  static isSnippet () {
    return this.#componentType === this.SNIPPET_COMPONENT_TYPE
  }

}

export default Config
