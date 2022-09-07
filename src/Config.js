import NodeUtils from './utils/NodeUtils.js'
import logger from './utils/Logger.js'

class Config {
  static COLLECTION_COMPONENT_TYPE = 'collection'
  static SECTION_COMPONENT_TYPE = 'section'
  static SNIPPET_COMPONENT_TYPE = 'snippet'
  static THEME_COMPONENT_TYPE = 'theme'
  static allowedComponentTypes = [
    Config.COLLECTION_COMPONENT_TYPE,
    Config.SECTION_COMPONENT_TYPE,
    Config.SNIPPET_COMPONENT_TYPE,
    Config.THEME_COMPONENT_TYPE]

  static async getComponentType () {
    const packageJson = await NodeUtils.getPackageJson()

    if (!packageJson.archie || !packageJson.archie.componentType) {
      throw new Error(`Couldn't find archie.componentType value in package.json. Please create the variable and set it to either one of these: theme/collection/section/snippet`)
    }

    const componentType = packageJson.archie.componentType.toLowerCase()

    if (!this.allowedComponentTypes.includes(componentType)) {
      throw new Error(`The value for archie.componentType from package.json must be changed to one of these: theme/collection/section/snippet, "${packageJson.archie.componentType}" is not an allowed value`)
    }
    logger.debug(`Component Type: "${componentType}"`)

    return componentType
  }

  static async getCollectionSectionsList (collectionName) {
    const packageJson = await NodeUtils.getPackageJson()

    if (!packageJson.archie || !packageJson.archie[collectionName]) {
      throw new Error(`Couldn't find archie.componentType value in package.json. Please create the variable and set it to either one of these: theme/collection/section/snippet`)
    }

  }

}

export default Config
