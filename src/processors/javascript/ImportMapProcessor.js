import path from 'node:path'
import glob from 'fast-glob'
import picomatch from 'picomatch'
import { init, parse } from 'es-module-lexer'
import FileUtils from '../../utils/FileUtils.js'
import WebUtils from '../../utils/WebUtils.js'

class ImportMapProcessor {
  static ImportMapFile = 'importmap.json'

  /**
   * @param {Set<string>} jsFiles
   * @param {string} outputFile
   * @param {string} rootFolder
   */
  static async build (jsFiles, outputFile, rootFolder) {
    /** @type {{imports: Map<string, string>}} */
    const importMap = await FileUtils.getJsonFileContents(this.ImportMapFile)
    const importMapEntries = this.resolveImportMapEntries(importMap.imports)
    const buildEntries = await this.resolveBuildEntries(jsFiles, importMapEntries, rootFolder)
    const importMapTags = this.generateImportMapTags(buildEntries)
    await FileUtils.writeFile(outputFile, importMapTags)
    return this.filterBuildEntries(buildEntries, jsFiles)
  }

  /**
   * @param {Map<string, string>} imports
   */
  static resolveImportMapEntries (imports) {
    /** @type {Map<string, string>} */
    const map = new Map()
    const entries = Object.entries(imports)
    const modulePatterns = entries.map(([, modulePattern]) => modulePattern)
    const files = glob.sync(modulePatterns)
    for (const [specifierPattern, modulePattern] of entries) {
      if (WebUtils.isUrl(modulePattern)) {
        map.set(specifierPattern, modulePattern)
        continue
      }
      const filteredFiles = files.filter(file => picomatch.isMatch(file, modulePattern))
      for (const file of filteredFiles) {
        map.set(this.getModuleSpecifier(file, specifierPattern), file)
      }
    }
    return map
  }

  /**
   * @param {Map<string, string>} importMapEntries
   */
  static invertImportMapEntries (importMapEntries) {
    /** @type {Map<string, string>} */
    const map = new Map()
    for (const [specifier, modulePath] of importMapEntries) {
      map.set(modulePath, specifier)
    }
    return map
  }

  /**
   * @param {string} file
   * @param {string} specifierPattern
   */
  static getModuleSpecifier (file, specifierPattern) {
    return specifierPattern.replace('*', path.parse(file).name)
  }

  /**
   * @param {Set<string>} jsFiles
   * @param {Map<string, string>} importMapEntries
   * @param {string} rootFolder
   */
  static async resolveBuildEntries (jsFiles, importMapEntries, rootFolder) {
    await init
    const invertedImportMapEntries = this.invertImportMapEntries(importMapEntries)
    /** @type {Map<string, string>} */
    const map = new Map()
    const promises = []
    for (const file of jsFiles) {
      const modulePath = path.relative(rootFolder, file)
      const moduleSpecifier = invertedImportMapEntries.get(modulePath)
      if (moduleSpecifier) {
        map.set(moduleSpecifier, file)
        promises.push(this.processJsFile(file, importMapEntries, map))
      }
    }
    await Promise.all(promises)
    return map
  }

  /**
   * @param {string} file
   * @param {Map<string, string>} importMapEntries
   * @param {Map<string, string>} buildEntries
   */
  static async processJsFile (file, importMapEntries, buildEntries) {
    const fileContents = await FileUtils.getFileContents(file)
    const [imports] = parse(fileContents)
    const promises = []
    for (let i = 0; i < imports.length; i++) {
      const moduleSpecifier = imports[i].n
      if (!moduleSpecifier) continue
      const modulePath = importMapEntries.get(moduleSpecifier)
      if (!modulePath) continue
      if (WebUtils.isUrl(modulePath)) {
        buildEntries.set(moduleSpecifier, modulePath)
        continue
      }
      if (!buildEntries.has(moduleSpecifier)) {
        buildEntries.set(moduleSpecifier, modulePath)
        promises.push(this.processJsFile(modulePath, importMapEntries, buildEntries))
      }
    }
    await Promise.all(promises)
  }

  /**
   * @param {Map<string, string>} buildEntries
   */
  static generateImportMapTags (buildEntries) {
    const entriesWithAssetUrl = this.getEntriesWithAssetUrl(buildEntries)
    return [this.generateImportMapTag(entriesWithAssetUrl), ...this.generateModulePreloadTags(entriesWithAssetUrl)].join('\n')
  }

  /**
   * @param {Map<string, string>} buildEntries
   */
  static getEntriesWithAssetUrl (buildEntries) {
    /** @type {Map<string, string>} */
    const map = new Map()
    for (const [specifier, modulePath] of buildEntries) {
      map.set(specifier, this.assetUrl(modulePath))
    }
    return map
  }

  /**
   * @param {Map<string, string>} entriesWithAssetUrl
   */
  static generateImportMapTag (entriesWithAssetUrl) {
    return `<script type="importmap">\n${JSON.stringify({ imports: Object.fromEntries(entriesWithAssetUrl) }, null, 2)}\n</script>`
  }

  /**
   * @param {Map<string, string>} entriesWithAssetUrl
   */
  static generateModulePreloadTags (entriesWithAssetUrl) {
    return [...entriesWithAssetUrl.values()].map(modulePath => `<link rel="modulepreload" href="${modulePath}">`)
  }

  /**
   * @param {string} assetPath
   */
  static assetUrl (assetPath) {
    return `{{ '${path.basename(assetPath)}' | asset_url }}`
  }

  /**
   * @param {Map<string, string>} buildEntries
   * @param {Set<string>} jsFiles
   */
  static filterBuildEntries (buildEntries, jsFiles) {
    /** @type {Map<string, string>} */
    const map = new Map()
    for (const [specifier, modulePath] of buildEntries) {
      if (!jsFiles.has(modulePath)) {
        map.set(specifier, modulePath)
      }
    }
    return map
  }
}

export default ImportMapProcessor
