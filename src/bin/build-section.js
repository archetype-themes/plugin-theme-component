#! /usr/bin/env node
import SectionBuilder from '../builders/SectionBuilder.js'
import NodeUtils from '../utils/NodeUtils.js'
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

const args = NodeUtils.getArgs()
if (!args[0]) {
  BinUtils.exitWithError('Please specify a section name. ie: yarn build-section some-smart-section-name')
}

await SectionBuilder.build(args[0])
