// External Dependencies
import { basename, join } from 'node:path'
import { ux } from '@oclif/core'
import merge from 'deepmerge'

// Internal Dependencies
import {
  copyFolder,
  exists,
  getFileContents,
  getJsonFileContents,
  isReadable,
  isWritable,
  saveFile
} from '../utils/FileUtils.js'

class CollectionInstaller {
  /**
   * Install Collection Within a Theme
   * @param {import('../models/Theme.js').default} theme
   * @param {module:models/Collection} collection
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async install (theme, collection) {
    const fileOperations = []
    // Copy Asset Folder
    fileOperations.push(copyFolder(collection.build.assetsFolder, theme.assetsFolder))

    // Copy Snippets Folder
    fileOperations.push(copyFolder(collection.build.snippetsFolder, theme.snippetsFolder))

    // Merge & Install Storefront Locales
    if (collection.build.locales) {
      fileOperations.push(this.writeLocales(collection.build.locales, theme.localesFolder))
    }

    // Inject references to the Collection's main CSS and JS files in the theme's main liquid file
    fileOperations.push(this.injectAssetReferences(collection, theme))

    return Promise.all(fileOperations)
  }

  /**
   * Inject references to the Collection's main CSS and JS files in the theme's main liquid file
   * @param {module:models/Collection} collection
   * @param {import('../models/Theme.js').default} theme
   * @return {Promise<void>}
   */
  static async injectAssetReferences (collection, theme) {
    const injectableAssets = [
      {
        asset: collection.build.javascriptFile,
        tagTemplate: filename => `<script src="{{ '${filename}' | asset_url }}" async></script>`,
        loggerMessage: 'Source Collection Javascript file %s found.'
      },
      {
        asset: collection.build.stylesheet,
        tagTemplate: filename => `<link type="text/css" href="{{ '${filename}' | asset_url }}" rel="stylesheet">`,
        loggerMessage: 'Source Collection Stylesheet file %s found.',
        nameModifier: name => name.endsWith('.liquid') ? name.substring(0, name.lastIndexOf('.')) : name
      }
    ]

    const injections = []
    const themeLiquidFile = join(theme.rootFolder, 'layout', 'theme.liquid')
    const themeLiquid = (await isReadable(themeLiquidFile))
      ? await getFileContents(themeLiquidFile)
      : ''

    for (const { asset, tagTemplate, loggerMessage, nameModifier } of injectableAssets) {
      if (!asset || !await exists(asset)) continue

      ux.debug(loggerMessage, basename(asset))

      let assetBasename = basename(asset)
      if (nameModifier) assetBasename = nameModifier(assetBasename)

      if (themeLiquid.includes(assetBasename)) {
        ux.warn(`Html "script" tag injection unavailable: A conflictual reference to ${assetBasename} is already present within the theme.liquid file.`)
        continue
      }

      injections.push(tagTemplate(assetBasename))
    }

    if (await isWritable(themeLiquidFile) && injections.length > 0) {
      await this.writeAssetReferencesToThemeLiquidFile(injections, themeLiquid, themeLiquidFile)
    } else if (injections.length > 0) {
      this.injectionFailureWarning(`Theme Liquid file (${themeLiquidFile}) is not writable.`, injections)
    }
  }

  /**
   * Write Asset References to Theme Liquid File
   * @param {string[]} injections
   * @param {string} themeLiquid
   * @param {string} themeLiquidFile
   * @return {Promise<void>}
   */
  static async writeAssetReferencesToThemeLiquidFile (injections, themeLiquid, themeLiquidFile) {
    const closingHtmlHeadTagCount = (/<\/head>/g.exec(themeLiquid) || []).length

    // Exit if No </head> tag was found
    if (closingHtmlHeadTagCount === 0) {
      return this.injectionFailureWarning('Html head tag closure not found in "theme.liquid".', injections)
    }

    // Exit if Multiple </head> tags were found
    if (closingHtmlHeadTagCount > 1) {
      return this.injectionFailureWarning(
        `${closingHtmlHeadTagCount} instances of Html head tag closure found in "theme.liquid". It should only be present once.`,
        injections
      )
    }

    ux.debug('Injecting theme.liquid file with Collection Stylesheet and/or JavaScript file references.')
    themeLiquid = themeLiquid.replace('</head>', `${injections.join('\n')}\n</head>`)

    await saveFile(themeLiquidFile, themeLiquid)
  }

  static injectionFailureWarning (message, injections) {
    ux.warn(`
**************************************************************************************************
${message}

References to collection stylesheet and javaScript file will not be inserted automatically.
You should manually insert these lines inside your "theme.liquid" file:

 >>> ${injections.join('\n >>> ')}

**************************************************************************************************`)
  }

  /**
   * Write Locales, merging them atop of the theme's Locales
   * @param {Object} locales
   * @param {string} themeLocalesPath
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async writeLocales (locales, themeLocalesPath) {
    ux.debug('Merging Collection Locales with the Theme\'s Locales')
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
        const mergedLocale = merge(collectionLocale, themeLocale)

        fileOperations.push(saveFile(realTargetFile, JSON.stringify(mergedLocale, null, 2)))
      } else {
        // if No Theme Locale File was found for the current locale, check for a Default Theme Regular Locale File to determine 'default' status for the locale.
        const defaultLocaleFilename = `${locale}.default.json`
        const realTargetFile = await exists(join(themeLocalesPath, defaultLocaleFilename)) ? defaultTargetFile : targetFile

        fileOperations.push(saveFile(realTargetFile, JSON.stringify(collectionLocale, null, 2)))
      }
    }
    return Promise.all(fileOperations)
  }
}

export default CollectionInstaller
