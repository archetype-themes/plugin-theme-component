import BinUtils from '../utils/BinUtils.js'

// Make sure we are within a theme or collection architecture
let shopifyComponentType
try {
  shopifyComponentType = await BinUtils.getShopifyComponentType()
} catch (error) {
  BinUtils.exitWithError(error)
}

if (![BinUtils.THEME_SHOPIFY_COMPONENT_TYPE, BinUtils.COLLECTION_SHOPIFY_COMPONENT_TYPE].includes(shopifyComponentType)) {
  BinUtils.exitWithError(`INVALID SHOPIFY COMPONENT TYPE: "${shopifyComponentType}". This script can only be run from a "theme" or "collection" Shopify Component.`)
}
