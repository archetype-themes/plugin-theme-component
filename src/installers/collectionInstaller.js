// External Dependencies
import { cp } from 'node:fs/promises'
import path, { basename, join } from 'node:path'
import merge from 'deepmerge'
import fg from 'fast-glob'

// Internal Dependencies
import {
  exists,
  getFileContents,
  getFileType,
  getJsonFileContents,
  isReadable,
  isWritable,
  saveFile
} from '../utils/fileUtils.js'
import Session from '../models/static/Session.js'
import { ChangeType } from '../utils/Watcher.js'
import { IMPORT_MAP_SNIPPET_FILENAME, THEME_LAYOUT_FILE } from '../config/constants.js'
import { debug, warn } from '../utils/logger.js'
import { downloadFiles, isUrl } from '../utils/webUtils.js'
import { getCopyright } from '../utils/copyright.js'
import FileAccessError from '../errors/FileAccessError.js'

/**
 * Install Collection Within a Theme
 * @param {module:models/Collection} collection
 * @param {import('../models/Theme.js').default} theme
 * @return {Promise<Awaited<unknown>[]>}
 */
export async function installCollection(collection, theme) {
  const fileOperations = []

  // Compute exclusions relative to the theme path
  const exclusions = await getExclusions(theme.rootFolder)

  // Install CSS Build
  if (collection.build.styles && (Session.firstRun || Session.changeType === ChangeType.Stylesheet || Session.changeType === ChangeType.Liquid)) {
    const stylesheet = join(theme.assetsFolder, collection.build.stylesheet)
    if (!exclusions?.includes(stylesheet)) {
      const stylesheetSavePromise = saveFile(stylesheet, collection.build.styles)
      fileOperations.push(stylesheetSavePromise)
      fileOperations.push(injectAssetReferences(stylesheet, theme))
    }
  }

  // Install Static Assets
  if (Session.firstRun || ChangeType.Asset === Session.changeType) {
    for (const assetFile of collection.assetFiles) {
      fileOperations.push(installFile(assetFile, theme.assetsFolder, collection.copyright, exclusions))
    }
  }

  // Install JavaScript Files With The ImportMap
  if (Session.firstRun || Session.changeType === ChangeType.JavaScript) {
    fileOperations.push(
      installJavascriptFiles(
        collection.jsFiles,
        collection.build.importMap,
        theme.assetsFolder,
        theme.snippetsFolder,
        collection.copyright,
        exclusions
      )
    )
  }

  // Install All Components As Snippets From Their Liquid Code Build
  if (Session.firstRun || Session.changeType === ChangeType.Liquid) {
    const snippetFilesWritePromises = Promise.all(
      collection.allComponents.map((component) => {
        const targetFile = join(theme.snippetsFolder, `${component.name}.liquid`)
        return !exclusions?.includes(targetFile) ? saveFile(targetFile, component.build.liquidCode) : null
      })
    )
    fileOperations.push(snippetFilesWritePromises)
  }

  return Promise.all(fileOperations)
}

/**
 * Install File And Prepend Copyright
 * @param {string} sourceFile
 * @param {string} targetFolder
 * @param {string} copyrightText
 * @param {string[]} [exclusions]
 * @returns {Promise<void>}
 */
export async function installFile(sourceFile, targetFolder, copyrightText, exclusions) {
  const fileBasename = basename(sourceFile)
  const fileType = getFileType(sourceFile)
  const targetFile = join(targetFolder, fileBasename)

  if (!exclusions?.includes(targetFile)) {
    const targetFileExists = await exists(targetFile)

    let sourceFileContents
    // Only fetch the data when needed
    if (fileType !== null || targetFileExists) {
      sourceFileContents = await getFileContents(sourceFile)
    }

    // Filter out vendor files
    if (copyrightText && fileType !== null && /vendor/gi.exec(sourceFile) !== null) {
      const copyright = getCopyright(fileType, copyrightText)
      sourceFileContents = copyright + sourceFileContents
    } else {
      debug(`Install Excluded Vendor File "${targetFile}"`)
    }

    // Compare file contents if the target file exists and only save the file if there is a difference
    if (targetFileExists) {
      const targetFileContents = await getFileContents(targetFile)
      if (targetFileContents !== sourceFileContents) {
        return saveFile(targetFile, sourceFileContents)
      } else {
        debug(`Ignored installing "${fileBasename}" file since its contents are identical to the current version`)
      }
    }
    // When the file type is known,
    // and we have a copyright text, we save the file contents with the added copyright text
    else if (fileType !== null && copyrightText) {
      return saveFile(targetFile, sourceFileContents)
    }
    // When the file type is unknown, we did not apply copyright text and the file can be copied as is
    else {
      return cp(sourceFile, targetFile, { preserveTimestamps: true })
    }
  } else {
    debug(`Install Excluded Filtered File "${targetFile}"`)
  }
}

/**
 * Install import map files to the assets folder
 * @param {Map<string, string>} buildEntries - ImportMap Build Entries
 * @param {string} assetsFolder - Assets Install Folder
 * @param {string} copyrightText - Copyright Text
 * @param {string[]} [exclusions] - Files to exclude
 * @return {Promise<Awaited<Awaited<void>[]>[]>}
 */
async function installImportMapFiles(buildEntries, assetsFolder, copyrightText, exclusions) {
  const localFiles = []
  const remoteFiles = []
  for (const [, modulePath] of buildEntries) {
    if (isUrl(modulePath)) {
      remoteFiles.push(modulePath)
    } else {
      localFiles.push(modulePath)
    }
  }

  const downloadPromiseAll = downloadFiles(remoteFiles, assetsFolder)

  const fileOperations = []
  for (const assetFile of localFiles) {
    fileOperations.push(installFile(assetFile, assetsFolder, copyrightText, exclusions))
  }

  return Promise.all([fileOperations, downloadPromiseAll])
}

/**
 * Install Javascript Files
 * @param {string[]} jsFiles - Full path to Components' JS Files
 * @param importMap - ImportMap Build
 * @param {string} assetsFolder - Assets Install Folder
 * @param {string} snippetsFolder - Snippets Install Folder
 * @param {string} copyrightText - Copyright Text
 * @param {string[]} [exclusions] - Excluded files
 * @returns {Promise<Awaited<void>[]>}
 */
async function installJavascriptFiles(jsFiles, importMap, assetsFolder, snippetsFolder, copyrightText, exclusions) {
  const fileOperations = []
  if (importMap?.entries.size) {
    fileOperations.push(installImportMapFiles(importMap.entries, assetsFolder, copyrightText, exclusions))
  }
  if (importMap?.tags) {
    const importMapSnippet = join(snippetsFolder, IMPORT_MAP_SNIPPET_FILENAME)
    if (!exclusions?.includes(importMapSnippet)) {
      fileOperations.push(saveFile(importMapSnippet, importMap.tags))
    }
  }

  for (const jsFile of jsFiles) {
    fileOperations.push(installFile(jsFile, assetsFolder, copyrightText, exclusions))
  }
  return Promise.all(fileOperations)
}

/**
 * Get Exclusions
 * @param {string} targetPath
 * @returns {Promise<string[]>}
 */
async function getExclusions(targetPath) {
  let exclusions = []
  if (Session.config?.exclude) {
    exclusions = await fg(Session.config.exclude, { cwd: targetPath, dot: true })
    exclusions = exclusions.map((filePath) => path.join(targetPath, filePath))
  }
  return exclusions
}

/**
 * Inject references to the Collection's main CSS and JS files in the theme's main liquid file
 * @param {string} stylesheet
 * @param {import('../models/Theme.js').default} theme
 * @return {Promise<void>}
 */
export async function injectAssetReferences(stylesheet, theme) {
  const stylesheetBasename = basename(stylesheet)

  const themeLiquidFile = join(theme.rootFolder, THEME_LAYOUT_FILE)
  let themeLiquid = (await isReadable(themeLiquidFile)) ? await getFileContents(themeLiquidFile) : ''

  if (themeLiquid.includes(stylesheetBasename)) {
    warn(
      `Html "script" tag injection unavailable: A conflictual reference to ${stylesheetBasename} is already present within the theme.liquid file.`
    )
  } else {
    if (!(await isWritable(themeLiquidFile))) {
      throw new FileAccessError(`Theme Liquid file (${themeLiquidFile}) is not writable.`)
    }

    const closingHtmlHeadTagCount = (/<\/head>/g.exec(themeLiquid) || []).length

    // Exit if No </head> tag was found
    if (closingHtmlHeadTagCount === 0) {
      throw new Error('Injection Error: Html head tag closure not found in "theme.liquid".')
    }

    // Exit if Multiple </head> tags were found
    if (closingHtmlHeadTagCount > 1) {
      throw new Error(
        `Injection Error: ${closingHtmlHeadTagCount} instances of Html head tag closure found in "theme.liquid". It should only be present once.`
      )
    }

    debug('Injecting theme.liquid file with Collection Stylesheet file references.')
    const tagTemplate = `<link type="text/css" href="{{ '${stylesheetBasename}' | asset_url }}" rel="stylesheet">`
    themeLiquid = themeLiquid.replace('</head>', `${tagTemplate}\n</head>`)

    return saveFile(themeLiquidFile, themeLiquid)
  }
}
