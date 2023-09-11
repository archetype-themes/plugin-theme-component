// Internal Modules
import CLI from '../../config/CLI.js'
import ConfigError from '../../errors/ConfigError.js'
import NodeConfig from '../models/NodeConfig.js'
import logger from '../../utils/Logger.js'

class NodeConfigFactory {
  /**
   * Init Archie Config
   * @param {Object} packageManifest
   * @return {void}
   */
  static fromPackageManifest (packageManifest) {
    // Validate and load Component Type
    NodeConfig.componentType = this.#findComponentType(packageManifest)

    // Load Component Path, if available
    if (packageManifest.archie?.componentPath) {
      NodeConfig.componentPath = packageManifest.archie.componentPath
    }

    if (packageManifest.archie?.embedLocales) {
      NodeConfig.embedLocales = packageManifest.archie.embedLocales
    }

    if (NodeConfig.isTheme()) {
      NodeConfig.collections = this.#findCollections(packageManifest)
    }
  }

  /**
   * Get Component Type
   * @param {Object} packageManifest
   * @return {string}
   */
  static #findComponentType (packageManifest) {
    /** @var {archie} packageJson.archie **/
    if (!packageManifest.archie?.componentType) {
      throw new ConfigError(`Couldn't find archie.componentType value in package.json. Please create the variable and set it to either one of these: ${CLI.AVAILABLE_COMPONENT_TYPES.join('/')}`)
    }

    const componentType = packageManifest.archie.componentType.toLowerCase()

    if (!CLI.AVAILABLE_COMPONENT_TYPES.includes(componentType)) {
      throw new ConfigError(`Invalid Archie Component Type: The value for archie.componentType from package.json must be changed to one of these: ${CLI.AVAILABLE_COMPONENT_TYPES.join('/')}, "${packageManifest.archie.componentType}" is not an allowed value`)
    }
    logger.debug(`Component Type: "${componentType}"`)

    return componentType
  }

  /**
   * Get Component Type
   * @param {Object} packageManifest
   * @return {string[]}
   */
  static #findCollections (packageManifest) {
    /** @var {archie} packageJson.archie **/
    return packageManifest.archie?.collections ? packageManifest.archie.collections : []
  }
}

export default NodeConfigFactory
