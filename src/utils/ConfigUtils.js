import NodeUtils from './NodeUtils.js'
import logger from './Logger.js'
import ArchieComponents from '../config/ArchieComponents.js'
import ArchieNodeConfig from '../models/static/ArchieNodeConfig.js'

class ConfigUtils {

  /**
   * Init Global Config, currently only sets targetComponent type
   * @return {Promise<void>}
   */
  static async initConfig () {
    ArchieNodeConfig.componentType = await this.findComponentType()
    ArchieNodeConfig.collections = await this.findCollections()
  }

  /**
   * Get Component Type
   * @return {Promise<string>}
   */
  static async findComponentType () {
    const packageJson = await NodeUtils.getPackageJson()
    /** @var {archie} packageJson.archie **/
    if (!packageJson.archie || !packageJson.archie.componentType) {
      throw new Error(`Couldn't find archie.componentType value in package.json. Please create the variable and set it to either one of these: theme/collection/section/snippet`)
    }

    const componentType = packageJson.archie.componentType.toLowerCase()

    if (!ArchieComponents.NODE_CONFIG_ALLOWED_COMPONENT_TYPES.includes(componentType)) {
      throw new Error(`The value for archie.componentType from package.json must be changed to one of these: theme/collection/section/snippet, "${packageJson.archie.componentType}" is not an allowed value`)
    }
    logger.debug(`Component Type: "${componentType}"`)

    return componentType
  }

  /**
   * Get Component Type
   * @return {Promise<string[]>}
   */
  static async findCollections () {
    const packageJson = await NodeUtils.getPackageJson()
    /** @var {archie} packageJson.archie **/
    if (packageJson.archie && packageJson.archie.collections) {
      return packageJson.archie.collections
    }

    return []
  }
}

export default ConfigUtils
