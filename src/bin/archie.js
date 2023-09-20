#!/usr/bin/env node

import BuildCommand from '../commands/BuildCommand.js'
import Session from '../models/static/Session.js'
import CLICommands from '../config/CLICommands.js'
import SessionFactory from '../factory/SessionFactory.js'
import CreateCommand from '../commands/CreateCommand.js'
import InstallCommand from '../commands/InstallCommand.js'
import NodeUtils from '../utils/NodeUtils.js'

// Init NodeConfig & Session
let packageManifest
try {
  packageManifest = await NodeUtils.getPackageManifest()
  SessionFactory.fromArgsAndManifest(NodeUtils.getArgs(), packageManifest)
} catch (error) {
  NodeUtils.exitWithError(error)
}

try {
  switch (Session.command) {
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
