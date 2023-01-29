#!/usr/bin/env node

import BuildCommand from '../cli/commands/BuildCommand.js'
import CreateCommand from '../cli/commands/CreateCommand.js'
import InstallCommand from '../cli/commands/InstallCommand.js'
import ArchieCLIFactory from '../cli/factories/ArchieCLIFactory.js'
import ArchieConfigFactory from '../cli/factories/ArchieConfigFactory.js'
import NodeUtils from '../utils/NodeUtils.js'

//Init ArchieConfig & ArchieCLI
let archieCLI
try {
  await ArchieConfigFactory.fromPackageJsonData(NodeUtils.getPackageJsonData())
  archieCLI = ArchieCLIFactory.fromCommandLineInput(NodeUtils.getArgs())
} catch (error) {
  NodeUtils.exitWithError(error)
}

try {
  switch (archieCLI.command) {
    case BuildCommand.NAME:
      await BuildCommand.execute(archieCLI.commandOption, archieCLI.targetComponentName, archieCLI.watchMode)
      break
    case CreateCommand.NAME:
      await CreateCommand.execute(archieCLI.commandOption, archieCLI.targetComponentName)
      break
    case InstallCommand.NAME:
      await InstallCommand.execute(archieCLI.targetComponentName, archieCLI.watchMode)
      break
    // There is no need for a default case - "Invalid command" was already handled in ArchieCLIFactory call above
  }
} catch (error) {
  NodeUtils.exitWithError(error)
}
