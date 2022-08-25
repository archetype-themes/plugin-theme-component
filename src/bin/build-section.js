#! /usr/bin/env node
import SectionBuilder from '../builders/SectionBuilder.js'
import NodeUtils from '../utils/NodeUtils.js'
import BinUtils from '../utils/BinUtils.js'

// Make sure we are within the Archie Monorepo
try {
  await BinUtils.validatePackageIsArchie()
} catch (error) {
  BinUtils.exitWithError(error)
}

const args = NodeUtils.getArgs()
if (!args[0]) {
  BinUtils.exitWithError('Please specify a section name. ie: yarn build-section some-smart-section-name')
}

await SectionBuilder.build(args[0])
