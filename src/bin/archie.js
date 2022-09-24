#!/usr/bin/env node

import ConfigUtils from '../utils/ConfigUtils.js'
import NodeUtils from '../utils/NodeUtils.js'
import ArchieUtils from '../utils/ArchieUtils.js'

//Init Config
try {
  await ConfigUtils.initConfig()
} catch (error) {
  NodeUtils.exitWithError(error)
}

await ArchieUtils.initArchie()
