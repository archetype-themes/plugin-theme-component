#!/usr/bin/env node

import ArchieCLI from '../cli/models/ArchieCLI.js'
import ArchieCLIFactory from '../cli/factories/ArchieCLIFactory.js'
import ConfigUtils from '../utils/ConfigUtils.js'
import NodeUtils from '../utils/NodeUtils.js'
import InstallCommand from '../cli/commands/InstallCommand.js'
import BuildCommand from '../cli/commands/BuildCommand.js'
import CreateCommand from '../cli/commands/CreateCommand.js'

//Init Config
try {
  await ConfigUtils.initConfig()
} catch (error) {
  NodeUtils.exitWithError(error)
}

try {
  await ArchieCLIFactory.fromCommandLineInput()
} catch (error) {
  NodeUtils.exitWithError(error)
}

try {
  switch (ArchieCLI.command) {
    case BuildCommand.NAME:
      await BuildCommand.execute(ArchieCLI.commandOption, ArchieCLI.targetComponentName, ArchieCLI.watchMode)
      break
    case CreateCommand.NAME:
      await CreateCommand.execute(ArchieCLI.commandOption, ArchieCLI.targetComponentName)
      break
    case InstallCommand.NAME:
      await InstallCommand.execute(ArchieCLI.targetComponentName, ArchieCLI.watchMode)
      break
    // There is no need for a default case - "Invalid command" was already handled in ArchieUtils.initArchie() above
  }
} catch (error) {
  NodeUtils.exitWithError(error)
}
