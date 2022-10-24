#!/usr/bin/env node

import CollectionBuilder from '../builders/CollectionBuilder.js'
import SectionBuilder from '../builders/SectionBuilder.js'
import CollectionFactory from '../factory/CollectionFactory.js'
import SectionFactory from '../factory/SectionFactory.js'
import SectionGenerator from '../generators/SectionGenerator.js'
import SnippetGenerator from '../generators/SnippetGenerator.js'
import Archie from '../models/static/Archie.js'
import Config from '../models/static/Config.js'
import ArchieUtils from '../utils/ArchieUtils.js'
import ConfigUtils from '../utils/ConfigUtils.js'
import NodeUtils from '../utils/NodeUtils.js'
import SectionWatcher from '../watchers/SectionWatcher.js'
import CollectionWatcher from '../watchers/CollectionWatcher.js'
import ThemeFactory from '../factory/ThemeFactory.js'
import CollectionInstaller from '../Installers/CollectionInstaller.js'

//Init Config
try {
  await ConfigUtils.initConfig()
} catch (error) {
  NodeUtils.exitWithError(error)
}

try {
  await ArchieUtils.initArchie()
} catch (error) {
  NodeUtils.exitWithError(error)
}

// Build & Watch Commands
if ([Archie.BUILD_COMMAND, Archie.WATCH_COMMAND].includes(Archie.command)) {
  // Build/Watch Collection
  if (Archie.commandOption === Config.COLLECTION_COMPONENT_TYPE) {
    try {
      const collection = await CollectionFactory.fromArchieCall()
      await CollectionBuilder.build(collection)
      if (Archie.command === Archie.WATCH_COMMAND) {
        await CollectionWatcher.watch(collection)
      }
    } catch (error) {
      NodeUtils.exitWithError(error)
    }
  }
  // Build/Watch Section
  else if (Archie.commandOption === Config.SECTION_COMPONENT_TYPE) {
    try {
      const section = await SectionFactory.fromName(Archie.targetComponent)
      await SectionBuilder.build(section)

      if (Archie.command === Archie.WATCH_COMMAND) {
        await SectionWatcher.watch(section)
      }
    } catch (error) {
      NodeUtils.exitWithError(error)
    }
  }
}

// Create Command
else if (Archie.command === Archie.CREATE_COMMAND) {
  if (Archie.commandOption === Config.SECTION_COMPONENT_TYPE) {
    try {
      await SectionGenerator.generate(Archie.targetComponent)
    } catch (error) {
      NodeUtils.exitWithError(error)
    }
  }
  if (Archie.commandOption === Config.SNIPPET_COMPONENT_TYPE) {
    try {
      await SnippetGenerator.generate(Archie.targetComponent)
    } catch (error) {
      NodeUtils.exitWithError(error)
    }
  }
}

// Install Command
else if (Archie.command === Archie.INSTALL_COMMAND) {
  try {
    const collection = await CollectionFactory.fromName(Archie.targetComponent)
    const theme = await ThemeFactory.fromArchieCall()
    await CollectionBuilder.build(collection)
    await CollectionInstaller.install(collection, theme)
  } catch (error) {
    NodeUtils.exitWithError(error)
  }

}
