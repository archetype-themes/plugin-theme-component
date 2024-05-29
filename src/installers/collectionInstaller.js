// External Dependencies
import { cp } from 'node:fs/promises'
import path, { basename, join } from 'node:path'
import merge from 'deepmerge'

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
import { IMPORT_MAP_SNIPPET_FILENAME, LIQUID_EXTENSION, THEME_LAYOUT_FILE } from '../config/constants.js'
import { debug, warn } from '../utils/logger.js'
import { downloadFiles, isUrl } from '../utils/webUtils.js'
import { getCopyright } from '../utils/copyright.js'

/**
 * Install Collection Within a Theme
 * @param {module:models/Collection} collection
 * @param {import('../models/Theme.js').default} theme
 * @return {Promise<Awaited<unknown>[]>}
 */
export async function installCollection(collection, theme) {
  const fileOperations = []

  // Install CSS Build
  if (collection.build.styles && (Session.firstRun || Session.changeType === ChangeType.Stylesheet)) {
    const stylesheet = join(theme.assetsFolder, collection.build.stylesheet)
    const stylesheetSavePromise = saveFile(stylesheet, collection.build.styles)
    fileOperations.push(stylesheetSavePromise)
  }

  // Install Static Assets
  if (Session.firstRun || ChangeType.Asset === Session.changeType) {
    for (const assetFile of collection.assetFiles) {
      fileOperations.push(installFile(assetFile, theme.assetsFolder, collection.copyright))
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
        collection.copyright
      )
    )
  }

  // Install All Components As Snippets From Their Liquid Code Build
  if (Session.firstRun || Session.changeType === ChangeType.Liquid) {
    const snippetFilesWritePromises = Promise.all(
      collection.allComponents.map((component) =>
        saveFile(join(theme.snippetsFolder, `${component.name}.liquid`), component.build.liquidCode)
      )
    )
    fileOperations.push(snippetFilesWritePromises)
  }

  // Install Storefront Locales
  if (collection.build.locales && (Session.firstRun || Session.changeType === ChangeType.Locale)) {
    fileOperations.push(installLocales(collection.build.locales, theme.localesFolder))
  }

  // Inject references to the Collection's main CSS and JS files in the theme's main liquid file
  if (Session.firstRun) {
    fileOperations.push(injectAssetReferences(collection, theme))
  }

  return Promise.all(fileOperations)
}

/**
 * Inject references to the Collection's main CSS and JS files in the theme's main liquid file
 * @param {module:models/Collection} collection
 * @param {import('../models/Theme.js').default} theme
 * @return {Promise<void>}
 */
export async function injectAssetReferences(collection, theme) {
  const injectableAssets = [
    {
      asset: collection.build.stylesheet,
      tagTemplate: (filename) => `<link type="text/css" href="{{ '${filename}' | asset_url }}" rel="stylesheet">`,
      loggerMessage: 'Source Collection Stylesheet file %s found.',
      nameModifier: (name) => (name.endsWith(LIQUID_EXTENSION) ? name.substring(0, name.lastIndexOf('.')) : name)
    }
  ]

  const injections = []
  const themeLiquidFile = join(theme.rootFolder, THEME_LAYOUT_FILE)
  const themeLiquid = (await isReadable(themeLiquidFile)) ? await getFileContents(themeLiquidFile) : ''

  for (const { asset, tagTemplate, loggerMessage, nameModifier } of injectableAssets) {
    if (!asset || !(await exists(asset))) continue

    debug(loggerMessage + ':' + basename(asset))

    let assetBasename = basename(asset)
    if (nameModifier) assetBasename = nameModifier(assetBasename)

    if (themeLiquid.includes(assetBasename)) {
      warn(
        `Html "script" tag injection unavailable: A conflictual reference to ${assetBasename} is already present within the theme.liquid file.`
      )
      continue
    }

    injections.push(tagTemplate(assetBasename))
  }

  if ((await isWritable(themeLiquidFile)) && injections.length > 0) {
    await writeAssetReferencesToThemeLiquidFile(injections, themeLiquid, themeLiquidFile)
  } else if (injections.length > 0) {
    injectionFailureWarning(`Theme Liquid file (${themeLiquidFile}) is not writable.`, injections)
  }
}

function injectionFailureWarning(message, injections) {
  warn(`
**************************************************************************************************
${message}

References to collection stylesheet and javaScript file will not be inserted automatically.
You should manually insert these lines inside your "theme.liquid" file:

 >>> ${injections.join('\n >>> ')}

**************************************************************************************************`)
}

/**
 * Install File And Prepend Copyright
 * @param {string} sourceFile
 * @param {string} targetFolder
 * @param {string} copyrightText
 * @returns {Promise<void>}
 */
async function installFile(sourceFile, targetFolder, copyrightText) {
  const fileBasename = basename(sourceFile)
  const fileType = getFileType(sourceFile)
  const targetFile = join(targetFolder, fileBasename)
  const targetFileExists = await exists(targetFile)

  let sourceFileContents
  // Only fetch the data if we need to
  if (fileType !== null || targetFileExists) {
    sourceFileContents = await getFileContents(sourceFile)
  }

  if (copyrightText && fileType !== null && !isFileInVendorFolder(sourceFile)) {
    const copyright = getCopyright(fileType, copyrightText)
    sourceFileContents = copyright + sourceFileContents
  }

  if (targetFileExists) {
    const targetFileContents = await getFileContents(targetFile)
    if (targetFileContents !== sourceFileContents) {
      return saveFile(targetFile, sourceFileContents)
    } else {
      debug(`Ignored installing "${fileBasename}" file since its contents are identical to the current version`)
    }
  } else if (fileType !== null) {
    return saveFile(targetFile, sourceFileContents)
  } else {
    return cp(sourceFile, targetFile, { preserveTimestamps: true })
  }
}

/**
 * Install import map files to the assets folder
 * @param {Map<string, string>} buildEntries - ImportMap Build Entries
 * @param {string} assetsFolder - Assets Install Folder
 * @param {string} copyrightText - Copyright Text
 * @return {Promise<Awaited<Awaited<void>[]>[]>}
 */
async function installImportMapFiles(buildEntries, assetsFolder, copyrightText) {
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
    fileOperations.push(installFile(assetFile, assetsFolder, copyrightText))
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
 * @returns {Promise<Awaited<void>[]>}
 */
async function installJavascriptFiles(jsFiles, importMap, assetsFolder, snippetsFolder, copyrightText) {
  const fileOperations = []
  if (importMap.entries?.size) {
    fileOperations.push(installImportMapFiles(importMap.entries, assetsFolder, copyrightText))
  }
  if (importMap.tags) {
    fileOperations.push(saveFile(join(snippetsFolder, IMPORT_MAP_SNIPPET_FILENAME), importMap.tags))
  }

  for (const jsFile of jsFiles) {
    fileOperations.push(installFile(jsFile, assetsFolder, copyrightText))
  }
  return Promise.all(fileOperations)
}

/**
 * Write Locales, merging them atop of the theme's Locales
 * @param {Object} locales
 * @param {string} themeLocalesPath
 * @return {Promise<Awaited<unknown>[]>}
 */
async function installLocales(locales, themeLocalesPath) {
  debug("Merging Collection Locales with the Theme's Locales")
  const fileOperations = []

  // const collectionLocalesFolderEntries = await readdir(collectionLocalesPath, { withFileTypes: true })
  for (const locale of Object.keys(locales)) {
    const localeFilename = `${locale}.json`

    const defaultLocaleFilename = `${locale}.default.json`

    const targetFile = join(themeLocalesPath, localeFilename)
    const defaultTargetFile = join(themeLocalesPath, defaultLocaleFilename)

    const targetFileExists = await exists(targetFile)
    const defaultTargetFileExists = await exists(defaultTargetFile)
    const collectionLocale = locales[locale]
    if (targetFileExists || defaultTargetFileExists) {
      const realTargetFile = targetFileExists ? targetFile : defaultTargetFile
      const themeLocale = await getJsonFileContents(realTargetFile)
      const mergedLocale = merge(themeLocale, collectionLocale)

      fileOperations.push(saveFile(realTargetFile, JSON.stringify(mergedLocale, null, 2)))
    } else {
      // if No Theme Locale File was found for the current locale, check for a Default Theme Regular Locale File to determine 'default' status for the locale.
      const defaultLocaleFilename = `${locale}.default.json`
      const realTargetFile = (await exists(join(themeLocalesPath, defaultLocaleFilename)))
        ? defaultTargetFile
        : targetFile

      fileOperations.push(saveFile(realTargetFile, JSON.stringify(collectionLocale, null, 2)))
    }
  }
  return Promise.all(fileOperations)
}

/**
 * Validates If The File Is In The Vendor(s) Folder
 * @param {string} filePath
 * @returns {boolean}
 */
function isFileInVendorFolder(filePath) {
  const parts = path.parse(filePath)
  const folder = parts.dir.split(path.sep).pop()
  return folder === 'vendor' || folder === 'vendors'
}

/**
 * Write Asset References to Theme Liquid File
 * @param {string[]} injections
 * @param {string} themeLiquid
 * @param {string} themeLiquidFile
 * @return {Promise<void>}
 */
async function writeAssetReferencesToThemeLiquidFile(injections, themeLiquid, themeLiquidFile) {
  const closingHtmlHeadTagCount = (/<\/head>/g.exec(themeLiquid) || []).length

  // Exit if No </head> tag was found
  if (closingHtmlHeadTagCount === 0) {
    return injectionFailureWarning('Html head tag closure not found in "theme.liquid".', injections)
  }

  // Exit if Multiple </head> tags were found
  if (closingHtmlHeadTagCount > 1) {
    return injectionFailureWarning(
      `${closingHtmlHeadTagCount} instances of Html head tag closure found in "theme.liquid". It should only be present once.`,
      injections
    )
  }

  debug('Injecting theme.liquid file with Collection Stylesheet and/or JavaScript file references.')
  themeLiquid = themeLiquid.replace('</head>', `${injections.join('\n')}\n</head>`)

  await saveFile(themeLiquidFile, themeLiquid)
}
