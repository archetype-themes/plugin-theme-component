// Internal Modules
import CLI from '../../config/CLI.js'
import ConfigError from '../../errors/ConfigError.js'
import NodeConfig from '../models/NodeConfig.js'
import logger from '../../utils/Logger.js'

class NodeConfigFactory {
  /**
   * Init Archie Config
   * @param {Object} packageJsonData
   * @return {void}
   */
  static fromPackageJsonData (packageJsonData) {
    NodeConfig.componentType = this.#findComponentType(packageJsonData)
    if (NodeConfig.isTheme()) {
      NodeConfig.collections = this.#findCollections(packageJsonData)
    }
  }

  /**
   * Get Component Type
   * @param {Object} packageJsonData
   * @return {string}
   */
  static #findComponentType (packageJsonData) {
    /** @var {archie} packageJson.archie **/
    if (!packageJsonData.archie || !packageJsonData.archie.componentType) {
      throw new ConfigError(`Couldn't find archie.componentType value in package.json. Please create the variable and set it to either one of these: ${CLI.AVAILABLE_COMPONENT_TYPES.join('/')}`)
    }

    const componentType = packageJsonData.archie.componentType.toLowerCase()

    if (!CLI.AVAILABLE_COMPONENT_TYPES.includes(componentType)) {
      throw new ConfigError(`Invalid Archie Component Type: The value for archie.componentType from package.json must be changed to one of these: ${CLI.AVAILABLE_COMPONENT_TYPES.join('/')}, "${packageJsonData.archie.componentType}" is not an allowed value`)
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
}

export default NodeConfigFactory
