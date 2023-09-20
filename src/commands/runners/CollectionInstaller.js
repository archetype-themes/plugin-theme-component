// Node Core imports
import { mkdir } from 'node:fs/promises'
import { basename, join } from 'node:path'

// External Packages
import merge from 'deepmerge'

// Archie imports
import Components from '../../config/Components.js'
import { mergeObjectArraysByUniqueKey } from '../../utils/ArrayUtils.js'
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

    // Copy Sections Folder
    fileOperations.push(FileUtils.copyFolder(collection.build.sectionsFolder, theme.sectionsFolder))

    // Copy Snippets Folder
    fileOperations.push(FileUtils.copyFolder(collection.build.snippetsFolder, theme.snippetsFolder))

    // Merge & Copy Schema Locales
    if (collection.build.schemaLocales) {
      fileOperations.push(this.writeSchemaLocales(collection.build.schemaLocales, theme.localesFolder))
    }

    // Merge & Copy Settings Schema
    if (collection.build.settingsSchema) {
      fileOperations.push(this.writeSettingsSchema(theme.configFolder, collection.build.settingsSchema))
    }

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

  /**
   * Write Schema Locales, merging them atop of the theme's Schema Locales
   * @param {Object} collectionSchemaLocales
   * @param {string} themeLocalesPath
   * @return {Promise<Awaited<unknown>[]>}
   */
  static async writeSchemaLocales (collectionSchemaLocales, themeLocalesPath) {
    logger.debug('Merging Collection Schema Locales with the Theme\'s Schema Locales')
    const fileOperations = []

    // const collectionLocalesFolderEntries = await readdir(collectionLocalesPath, { withFileTypes: true })
    for (const locale of Object.keys(collectionSchemaLocales)) {
      const schemaLocaleFilename = `${locale}.schema.json`

      const defaultSchemaLocaleFilename = `${locale}.default.schema.json`

      const targetFile = join(themeLocalesPath, schemaLocaleFilename)
      const defaultTargetFile = join(themeLocalesPath, defaultSchemaLocaleFilename)

      const targetFileExists = await FileUtils.exists(targetFile)
      const defaultTargetFileExists = await FileUtils.exists(defaultTargetFile)
      const collectionSchemaLocale = collectionSchemaLocales[locale]
      if (targetFileExists || defaultTargetFileExists) {
        const realTargetFile = targetFileExists ? targetFile : defaultTargetFile
        const themeSchemaLocale = await FileUtils.getJsonFileContents(realTargetFile)
        const mergedSchemaLocale = merge(collectionSchemaLocale, themeSchemaLocale)

        fileOperations.push(FileUtils.writeFile(realTargetFile, JSON.stringify(mergedSchemaLocale, null, 2)))
      } else {
        // if No Theme Schema Locale File was found for the current locale, check for a Default Theme Regular Locale File in order to determine 'default' status for the locale.
        const defaultLocaleFilename = `${locale}.default.json`
        const realTargetFile = await FileUtils.exists(join(themeLocalesPath, defaultLocaleFilename)) ? defaultTargetFile : targetFile

        fileOperations.push(FileUtils.writeFile(realTargetFile, JSON.stringify(collectionSchemaLocale, null, 2)))
      }
    }
    return Promise.all(fileOperations)
  }

  /**
   * Write Settings Schema
   * @param {string} themeConfigFolder
   * @param {Object[]} collectionSettingsSchema
   * @return {Promise<void>}
   */
  static async writeSettingsSchema (themeConfigFolder, collectionSettingsSchema) {
    let finalSettingsSchema
    const themeSettingsSchemaFile = join(themeConfigFolder, Components.THEME_SETTINGS_SCHEMA_FILENAME)

    if (await FileUtils.exists(themeSettingsSchemaFile)) {
      const themeSettingsSchema = await FileUtils.getJsonFileContents(themeSettingsSchemaFile)
      finalSettingsSchema = mergeObjectArraysByUniqueKey(themeSettingsSchema, collectionSettingsSchema)
    } else if (!await FileUtils.exists(themeConfigFolder)) {
      await mkdir(themeConfigFolder)
      finalSettingsSchema = collectionSettingsSchema
    }

    return FileUtils.writeFile(themeSettingsSchemaFile, JSON.stringify(finalSettingsSchema, null, 2))
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
