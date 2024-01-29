#!/usr/bin/env node

import BuildCommand from '../commands/BuildCommand.js'
import GenerateCommand from '../commands/GenerateCommand.js'
import DevCommand from '../commands/DevCommand.js'
import InstallCommand from '../commands/InstallCommand.js'
import { BUILD_COMMAND_NAME, GENERATE_COMMAND_NAME, DEV_COMMAND_NAME, INSTALL_COMMAND_NAME, CONFIG_FILE_NAME } from '../config/CLI.js'
import NodeUtils from '../utils/NodeUtils.js'
import { decodeToml } from '../utils/TomlUtils.js'
import Session from '../models/static/Session.js'
import SessionFactory from '../factory/SessionFactory.js'
import { readFileSync } from 'node:fs'

try {
  // Init Config & Session
  const config = /** @type {{component: import('../models/static/Session.js').CLIConfig}} */ (decodeToml(readFileSync(CONFIG_FILE_NAME, 'utf8')))
  SessionFactory.fromArgsAndManifest(NodeUtils.getArgs(), config)

  switch (Session.command) {
    case BUILD_COMMAND_NAME:
      await BuildCommand.execute()
      break
    case GENERATE_COMMAND_NAME:
      await GenerateCommand.execute(config)
      break
    case DEV_COMMAND_NAME:
      await DevCommand.execute()
      break
    case INSTALL_COMMAND_NAME:
      await InstallCommand.execute()
      break
    // There is no need for a default case - "Invalid command" was already handled in the SessionFactory call above
  }
} catch (error) {
  NodeUtils.exitWithError(error)
}
