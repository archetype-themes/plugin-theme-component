// External Dependencies
import { access, constants, mkdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { cwd } from 'node:process'
import { Args, ux } from '@oclif/core'

// Internal Dependencies
import { BaseCommand, COMPONENT_ARG_NAME } from '../../../config/baseCommand.js'
import {
  COLLECTION_TYPE_NAME,
  COMPONENT_TYPE_NAME,
  COMPONENTS_FOLDER
} from '../../../config/Components.js'
import FileAccessError from '../../../errors/FileAccessError.js'
import Session from '../../../models/static/Session.js'
import {
  copyFolder,
  getFolderFilesRecursively
} from '../../../utils/FileUtils.js'
import {
  getCLIRootFolderName,
  getPackageManifest,
  getPackageName,
  getPackageScope
} from '../../../utils/NodeUtils.js'
import { getValuesFromArgvOrToml } from '../../../utils/SessionUtils.js'
import { logSeparator, logSpacer } from '../../../utils/LoggerUtils.js'

export default class Generate extends BaseCommand {
  static description = 'Generate canvas files for new components'

  static args = {
    [COMPONENT_ARG_NAME]: Args.string({
      description: 'Component name(s)',
      required: true
    })
  }

  // Enables limitless args entry
  static strict = false

  async run() {
    const { argv, flags } = await this.parse(Generate)
    BaseCommand.setUxOutputLevel(flags)
    const tomlConfig = await super.run()

    await Generate.setSessionValues(argv, tomlConfig)

    for (const componentName of Session.components) {
      ux.action.start(`Generating "${componentName}" ${COMPONENT_TYPE_NAME}`)

      const componentPath = join(COMPONENTS_FOLDER, componentName)
      const componentAbsolutePath = join(cwd(), componentPath)

      // Exit if the folder already exists
      let folderExists = false
      try {
        // This will throw an error if the folder doesn't exist.
        await access(componentAbsolutePath, constants.X_OK)
        // This only runs if the previous "access" call was successful, proving the folder already exists
        folderExists = true
      } catch {
        // An error is expected since the folder shouldn't exist
      }

      // Don't overwrite an existing component, throw an error
      if (folderExists) {
        throw new FileAccessError(
          `The "${componentName}" ${COMPONENT_TYPE_NAME} folder already exists. Please remove it or choose a different name.`
        )
      }

      const cliRootFolder = getCLIRootFolderName()
      const sourcesPath = join(cliRootFolder, 'resources/component-files')

      const packageManifest = await getPackageManifest()
      const packageScope = getPackageScope(packageManifest)
      const packageScopeName = packageScope.startsWith('@')
        ? packageScope.substring(1)
        : packageScope
      const packageName = getPackageName(packageManifest)

      const copyFolderOptions = {
        recursive: true,
        rename: ['component-name', componentName],
        jsTemplateVariables: {
          author: packageManifest.author
            ? packageManifest.author
            : 'Archetype Themes Limited Partnership',
          collectionName: packageName,
          collectionScope: packageScope,
          componentName,
          componentType: COMPONENT_TYPE_NAME,
          componentFolder: componentPath,
          gitUrl: `https://github.com/${packageScopeName}/${packageName}.git`,
          license: packageManifest.license
            ? packageManifest.license
            : 'UNLICENSED',
          packageName: `${packageScope}/${componentName}-${COMPONENT_TYPE_NAME}`
        }
      }

      // Copy files recursively
      await mkdir(componentAbsolutePath)
      await copyFolder(sourcesPath, componentAbsolutePath, copyFolderOptions)

      ux.action.stop('complete')
      ux.info('\nThe following files were created:')
      const files = await getFolderFilesRecursively(componentPath)
      files.map((file) => ux.info(relative(componentPath, file)))
      logSpacer()

      ux.info('Your new component is available at')
      ux.info('./' + componentPath)
      logSeparator()
      logSpacer()
    }
  }

  static async setSessionValues(argv, tomlConfig) {
    Session.callerType = COLLECTION_TYPE_NAME
    Session.components = getValuesFromArgvOrToml(
      COMPONENT_ARG_NAME,
      argv,
      tomlConfig
    )
  }
}
