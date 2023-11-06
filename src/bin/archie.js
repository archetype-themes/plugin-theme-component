#!/usr/bin/env node

import BuildCommand, { BUILD_COMMAND_NAME } from '../commands/BuildCommand.js'
import CreateCommand, { CREATE_COMMAND_NAME } from '../commands/CreateCommand.js'
import InstallCommand, { INSTALL_COMMAND_NAME } from '../commands/InstallCommand.js'
import NodeUtils from '../utils/NodeUtils.js'
import Session from '../models/static/Session.js'
import SessionFactory from '../factory/SessionFactory.js'

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
    case BUILD_COMMAND_NAME:
      await BuildCommand.execute()
      break
    case CREATE_COMMAND_NAME:
      await CreateCommand.execute(packageManifest)
      break
    case INSTALL_COMMAND_NAME:
      await InstallCommand.execute()
      break
    // There is no need for a default case - "Invalid command" was already handled in the SessionFactory call above
  }
} catch (error) {
  NodeUtils.exitWithError(error)
}
