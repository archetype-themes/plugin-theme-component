#!/usr/bin/env node

import BuildCommand from '../cli/commands/BuildCommand.js'
import CLISession from '../cli/models/CLISession.js'
import CLICommands from '../config/CLICommands.js'
import CLISessionFactory from '../cli/factories/CLISessionFactory.js'
import CreateCommand from '../cli/commands/CreateCommand.js'
import InstallCommand from '../cli/commands/InstallCommand.js'
import NodeUtils from '../utils/NodeUtils.js'

// Init NodeConfig & CLISession
let packageManifest
try {
  packageManifest = await NodeUtils.getPackageManifest()
  CLISessionFactory.fromArgsAndManifest(NodeUtils.getArgs(), packageManifest)
} catch (error) {
  NodeUtils.exitWithError(error)
}

try {
  switch (CLISession.command) {
    case CLICommands.BUILD_COMMAND_NAME:
      await BuildCommand.execute()
      break
    case CLICommands.CREATE_COMMAND_NAME:
      await CreateCommand.execute(packageManifest)
      break
    case CLICommands.INSTALL_COMMAND_NAME:
      await InstallCommand.execute()
      break
    // There is no need for a default case - "Invalid command" was already handled in ArchieCLIFactory call above
  }
} catch (error) {
  NodeUtils.exitWithError(error)
}
