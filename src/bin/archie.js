#!/usr/bin/env node

import CollectionBuilder from '../builders/CollectionBuilder.js'
import SectionBuilder from '../builders/SectionBuilder.js'
import ArchieComponents from '../config/ArchieComponents.js'
import ArchieCLICommands from '../config/ArchieCLICommands.js'
import CollectionFactory from '../factory/CollectionFactory.js'
import SectionFactory from '../factory/SectionFactory.js'
import SectionGenerator from '../generators/SectionGenerator.js'
import SnippetGenerator from '../generators/SnippetGenerator.js'
import ArchieCLI from '../models/static/ArchieCLI.js'
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

// Build Command
if (ArchieCLICommands.BUILD_COMMAND === ArchieCLI.command) {
  // Build/Watch Collection
  if (ArchieCLI.commandOption === ArchieComponents.COLLECTION_COMPONENT_TYPE) {
    try {
      const collection = await CollectionFactory.fromArchieCall()
      await CollectionBuilder.build(collection)
      if (ArchieCLI.watchMode) {
        await CollectionWatcher.buildOnChange(collection.rootFolder)
      }
    } catch (error) {
      NodeUtils.exitWithError(error)
    }
  }
  // Build/Watch Section
  else if (ArchieCLI.commandOption === ArchieComponents.SECTION_COMPONENT_TYPE) {
    try {
      const section = await SectionFactory.fromName(ArchieCLI.targetComponent)
      await SectionBuilder.build(section)

      if (ArchieCLI.watchMode) {
        await SectionWatcher.buildOnChange(section.rootFolder)
      }
    } catch (error) {
      NodeUtils.exitWithError(error)
    }
  }
}

// Create Command
else if (ArchieCLI.command === ArchieCLICommands.CREATE_COMMAND) {
  if (ArchieCLI.commandOption === ArchieComponents.SECTION_COMPONENT_TYPE) {
    try {
      await SectionGenerator.generate(ArchieCLI.targetComponent)
    } catch (error) {
      NodeUtils.exitWithError(error)
    }
  }
  if (ArchieCLI.commandOption === ArchieComponents.SNIPPET_COMPONENT_TYPE) {
    try {
      await SnippetGenerator.generate(ArchieCLI.targetComponent)
    } catch (error) {
      NodeUtils.exitWithError(error)
    }
  }
}

// Install Command
else if (ArchieCLI.command === ArchieCLICommands.INSTALL_COMMAND) {
  try {
    const collection = await CollectionFactory.fromName(Archie.targetComponent)
    const theme = await ThemeFactory.fromArchieCall()
    await CollectionBuilder.build(collection)
    await CollectionInstaller.install(collection, theme)
    if (ArchieCLI.watchMode) {
      await CollectionWatcher.installOnChange(collection.rootFolder)
    }
  } catch (error) {
    NodeUtils.exitWithError(error)
  }

}
