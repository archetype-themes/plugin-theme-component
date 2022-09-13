import NodeUtils from './NodeUtils.js'
import logger from './Logger.js'
import Config from '../Config.js'

class ConfigUtils {

  static async initConfig () {
    Config.componentType = await this.findComponentType()
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

    if (!Config.ALLOWED_COMPONENT_TYPES.includes(componentType)) {
      throw new Error(`The value for archie.componentType from package.json must be changed to one of these: theme/collection/section/snippet, "${packageJson.archie.componentType}" is not an allowed value`)
    }
    logger.debug(`Component Type: "${componentType}"`)

    return componentType
  }
}

export default ConfigUtils
