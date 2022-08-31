import NodeUtils from './NodeUtils.js'
import logger from './Logger.js'
import { exit } from 'node:process'

class BinUtils {
  static COLLECTION_SHOPIFY_COMPONENT_TYPE = 'collection'
  static SECTION_SHOPIFY_COMPONENT_TYPE = 'section'
  static SNIPPET_SHOPIFY_COMPONENT_TYPE = 'snippet'
  static THEME_SHOPIFY_COMPONENT_TYPE = 'theme'
  static acceptedShopifyComponentTypes = [
    BinUtils.COLLECTION_SHOPIFY_COMPONENT_TYPE,
    BinUtils.SECTION_SHOPIFY_COMPONENT_TYPE,
    BinUtils.SNIPPET_SHOPIFY_COMPONENT_TYPE,
    BinUtils.THEME_SHOPIFY_COMPONENT_TYPE]

  static async getShopifyComponentType () {
    const packageJson = await NodeUtils.getPackageJson()

    if (!packageJson.config || !packageJson.config.shopifyComponentType) {
      throw new Error(`Couldn't find config.shopifyComponentType value in package.json. Please create the variable and set it to either one of these: theme/collection/section/snippet`)
    }

    const shopifyComponentType = packageJson.config.shopifyComponentType.toLowerCase()

    if (!this.acceptedShopifyComponentTypes.includes(shopifyComponentType)) {
      throw new Error(`The value for config.shopifyComponentType from package.json must be changed to one of these: theme/collection/section/snippet, "${packageJson.config.shopifyComponentType}" is not an accepted value`)
    }
    logger.debug(`Shopify Component Type: "${shopifyComponentType}"`)

    return shopifyComponentType
  }

  /**
   *
   * @param {Error|string} error
   */
  static exitWithError (error) {
    if (error.message) {
      logger.error(error.message)
    } else {
      logger.error(error)
    }

    exit(1)
  }
}

export default BinUtils
