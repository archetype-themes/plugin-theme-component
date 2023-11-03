// Node Core imports
import { basename, join } from 'node:path'

// Archie imports
import FileUtils from '../../utils/FileUtils.js'
import logger from '../../utils/Logger.js'

class CollectionInstaller {
  /**
   * Install Collection Within a Theme
   * @param {Theme} theme
   * @param {module:models/Collection} collection
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async install (theme, collection) {
    const fileOperations = []
    // Copy Asset Folder
    fileOperations.push(FileUtils.copyFolder(collection.build.assetsFolder, theme.assetsFolder))

    // Copy Snippets Folder
    fileOperations.push(FileUtils.copyFolder(collection.build.snippetsFolder, theme.snippetsFolder))

    // Inject references to the Collection's main CSS and JS files in the theme's main liquid file
    fileOperations.push(this.injectAssetReferences(collection, theme))

    return Promise.all(fileOperations)
  }

  /**
   * Inject references to the Collection's main CSS and JS files in the theme's main liquid file
   * @param {module:models/Collection} collection
   * @param {Theme} theme
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
    const themeLiquid = (await FileUtils.isReadable(themeLiquidFile))
      ? await FileUtils.getFileContents(themeLiquidFile)
      : ''

    for (const { asset, tagTemplate, loggerMessage, nameModifier } of injectableAssets) {
      if (!asset || !await FileUtils.exists(asset)) continue

      logger.debug(loggerMessage, basename(asset))

      let assetBasename = basename(asset)
      if (nameModifier) assetBasename = nameModifier(assetBasename)

      if (themeLiquid.includes(assetBasename)) {
        logger.warn(`Html "script" tag injection unavailable: A conflictual reference to ${assetBasename} is already present within the theme.liquid file.`)
        continue
      }

      injections.push(tagTemplate(assetBasename))
    }

    if (await FileUtils.isWritable(themeLiquidFile) && injections.length > 0) {
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

    logger.debug('Injecting theme.liquid file with Collection Stylesheet and/or JavaScript file references.')
    themeLiquid = themeLiquid.replace('</head>', `${injections.join('\n')}\n</head>`)

    await FileUtils.writeFile(themeLiquidFile, themeLiquid)
  }

  static injectionFailureWarning (message, injections) {
    logger.warn(`
**************************************************************************************************
${message}

References to collection stylesheet and javaScript file will not be inserted automatically.
You should manually insert these lines inside your "theme.liquid" file:

 >>> ${injections.join('\n >>> ')}

**************************************************************************************************`)
  }
}

export default CollectionInstaller
