import ArchieConfig from '../models/ArchieConfig.js'
import logger from '../../utils/Logger.js'

class ArchieConfigFactory {

  /**
   * Init Archie Config
   * @param {Object} packageJsonData
   * @return {Promise<void>}
   */
  static fromPackageJsonData (packageJsonData) {
    ArchieConfig.componentType = this.#findComponentType(packageJsonData)
    ArchieConfig.collections = this.#findCollections(packageJsonData)
    ArchieConfig.gridSize = this.#getGridSize(packageJsonData)
  }

  /**
   * Get Component Type
   * @param {Object} packageJsonData
   * @return {string}
   */
  static #findComponentType (packageJsonData) {

    /** @var {archie} packageJson.archie **/
    if (!packageJsonData.archie || !packageJsonData.archie.componentType) {
      throw new Error(`Couldn't find archie.componentType value in package.json. Please create the variable and set it to either one of these: theme/collection/section/snippet`)
    }

    const componentType = packageJsonData.archie.componentType.toLowerCase()

    if (!ArchieConfig.ALLOWED_COMPONENT_TYPES.includes(componentType)) {
      throw new Error(`The value for archie.componentType from package.json must be changed to one of these: theme/collection/section/snippet, "${packageJsonData.archie.componentType}" is not an allowed value`)
    }
    logger.debug(`Component Type: "${componentType}"`)

    return componentType
  }

  /**
   * Get Component Type
   * @param {Object} packageJsonData
   * @return {string[]}
   */
  static #findCollections (packageJsonData) {
    /** @var {archie} packageJson.archie **/
    if (packageJsonData.archie && packageJsonData.archie.collections) {
      return packageJsonData.archie.collections
    }

    return []
  }

  /**
   * @param {Object} packageJsonData
   * @return {number|null}
   */
  static #getGridSize (packageJsonData) {
    /** @var {number} packageJson.archie.gridSize **/
    if (packageJsonData.archie && packageJsonData.archie.gridSize) {
      return packageJsonData.archie.gridSize
    }
    logger.warn('GridSize is missing!')
    logger.warn('If you are using PostCSS and intend to use custom mixins, you need to specify the Grid Size in package.json. ie: {archie: {"gridSize": 6}}.')

    return null
  }
}

export default ArchieConfigFactory
