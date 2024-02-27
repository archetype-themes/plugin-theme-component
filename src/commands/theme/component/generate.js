// Node.js Imports
import { access, constants, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { Args } from '@oclif/core'

// Internal Imports
import Session from '../../../models/static/Session.js'
import FileUtils from '../../../utils/FileUtils.js'
import logger from '../../../utils/Logger.js'
import {
  getCLIRootFolderName, getPackageManifest,
  getPackageName,
  getPackageRootFolder,
  getPackageScope
} from '../../../utils/NodeUtils.js'
import { COMPONENTS_FOLDER } from '../../../config/Components.js'
import FileAccessError from '../../../errors/FileAccessError.js'
import { getTomlConfig } from '../../../utils/TomlUtils.js'
import { sessionFactory } from '../../../factory/SessionFactory.js'
import Dev, { COMPONENT_ARG_NAME } from './dev.js'
import { BaseCommand } from '../../../config/baseCommand.js'

export default class Generate extends BaseCommand {
  static hidden = true // Hide the command from help

  static args = {
    [COMPONENT_ARG_NAME]: Args.string({
      description: 'Component name(s)',
      required: true
    })
  }

  async run () {
    const { args } = await this.parse(Generate)

    const commandElements = this.id.split(':')
    Session.command = commandElements[commandElements.length - 1]

    const tomlConfig = await getTomlConfig()

    sessionFactory(this.id, tomlConfig)
    Dev.setSessionArgs(args, tomlConfig)

    for (const componentName of Session.components) {
      const componentFolder = join(COMPONENTS_FOLDER, componentName)
      const componentRootFolder = join(getPackageRootFolder(), componentFolder)

      logger.info(`Generating "${componentName}" ${Session.targetType}`)

      // Exit if the folder already exists
      let folderExists = false
      try {
        // This will throw an error if the folder doesn't exist.
        await access(componentRootFolder, constants.X_OK)
        // This only runs if the previous "access" call was successful, proving the folder already exists
        folderExists = true
      } catch {
        // An error is expected since the folder shouldn't exist
      }

      // Don't overwrite an existing component, throw an error
      if (folderExists) {
        throw new FileAccessError(`The "${componentName}" ${Session.targetType} folder already exists. Please remove it or choose a different name.`)
      }

      const cliRootFolder = getCLIRootFolderName()
      const componentSources = join(cliRootFolder, 'resources/component-files')

      const packageScope = getPackageScope()
      const packageScopeName = packageScope.startsWith('@') ? packageScope.substring(1) : packageScope
      const packageName = getPackageName()
      const packageManifest = await getPackageManifest()
      const copyFolderOptions = {
        recursive: true,
        jsTemplateVariables: {
          author: packageManifest.author ? packageManifest.author : 'Archetype Themes Limited Partnership',
          collectionName: packageName,
          collectionScope: packageScope,
          componentName,
          componentType: Session.targetType,
          componentFolder,
          gitUrl: `https://github.com/${packageScopeName}/${packageName}.git`,
          license: packageManifest.license ? packageManifest.license : 'UNLICENSED',
          packageName: `${packageScope}/${componentName}-${Session.targetType}`
        }
      }

      // Copy files recursively
      await mkdir(componentRootFolder)
      await FileUtils.copyFolder(componentSources, componentRootFolder, copyFolderOptions)
    }
  }
}
