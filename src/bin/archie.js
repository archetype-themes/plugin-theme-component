#!/usr/bin/env node

import BuildCommand from '../cli/commands/BuildCommand.js'
import CreateCommand from '../cli/commands/CreateCommand.js'
import InstallCommand from '../cli/commands/InstallCommand.js'
import CLISessionFactory from '../cli/factories/CLISessionFactory.js'
import NodeConfigFactory from '../cli/factories/NodeConfigFactory.js'
import NodeUtils from '../utils/NodeUtils.js'
import CLICommands from '../config/CLICommands.js'

// Init NodeConfig & CLISession
let cliSession
try {
  NodeConfigFactory.fromPackageJsonData(await NodeUtils.getPackageManifest())
  cliSession = CLISessionFactory.fromCommandLineInput(NodeUtils.getArgs())
} catch (error) {
  NodeUtils.exitWithError(error)
}

try {
  switch (cliSession.command) {
    case CLICommands.BUILD_COMMAND_NAME:
      await BuildCommand.execute(cliSession.commandOption, cliSession.targetComponentName, cliSession.watchMode)
      break
    case CLICommands.CREATE_COMMAND_NAME:
      await CreateCommand.execute(cliSession.commandOption, cliSession.targetComponentName)
      break
    case CLICommands.INSTALL_COMMAND_NAME:
      await InstallCommand.execute(cliSession.targetComponentName, cliSession.watchMode)
      break
    // There is no need for a default case - "Invalid command" was already handled in ArchieCLIFactory call above
  }
} catch (error) {
  NodeUtils.exitWithError(error)
}
