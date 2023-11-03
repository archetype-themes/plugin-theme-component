import path from 'node:path'
import glob from 'fast-glob'
import picomatch from 'picomatch'
import { init, parse } from 'es-module-lexer'
import FileUtils from '../../utils/FileUtils.js'
import WebUtils from '../../utils/WebUtils.js'

class ImportMapProcessor {
  static ImportMapFile = 'importmap.json'

  /**
   * Build import map file and return build entries
   * @param {Set<string>} jsFiles
   * @param {string} outputFile
   */
  static async build (jsFiles, outputFile) {
    /** @type {{imports: Object<string, string>}} */
    const importMap = await FileUtils.getJsonFileContents(this.ImportMapFile)
    const importMapEntries = this.resolveImportMapEntries(importMap.imports)
    const buildEntries = await this.resolveBuildEntries(jsFiles, importMapEntries)
    const importMapTags = this.generateImportMapTags(buildEntries)
    await FileUtils.writeFile(outputFile, importMapTags)
    return this.filterBuildEntries(buildEntries, jsFiles)
  }

  /**
   * Resolve import map entries
   * @param {Object<string, string>} imports
   */
  static resolveImportMapEntries (imports) {
    /** @type {Map<string, string>} */
    const map = new Map()
    const entries = Object.entries(imports)
    const modulePatterns = this.resolveModulePatterns(entries)
    const files = glob.sync(modulePatterns)
    for (const [specifierPattern, modulePattern] of entries) {
      if (WebUtils.isUrl(modulePattern)) {
        map.set(specifierPattern, modulePattern)
        continue
      }
      const filteredFiles = this.filterFiles(files, modulePattern)
      for (const file of filteredFiles) {
        map.set(this.getModuleSpecifier(file, specifierPattern), file)
      }
    }
    return map
  }

  /**
   * Resolve glob patterns from import map entries
   * @param {[string, string][]} entries
   */
  static resolveModulePatterns (entries) {
    return entries
      .map(([, modulePattern]) => modulePattern)
      .filter(modulePattern => !WebUtils.isUrl(modulePattern))
  }

  /**
   * Filter files by module pattern
   * @param {string[]} files
   * @param {string} modulePattern
   */
  static filterFiles (files, modulePattern) {
    const isMatch = picomatch(modulePattern)
    return files.filter(file => {
      if (!isMatch(file)) {
        return false
      }
      return true
    })
  }

  /**
   * Get the module specifier for a given JS file
   * @param {string} file
   * @param {string} specifierPattern
   */
  static getModuleSpecifier (file, specifierPattern) {
    return specifierPattern.replace(/\*$/, path.parse(file).name)
  }

  /**
   * Resolve build entries from component JS entry points
   * @param {Set<string>} jsFiles
   * @param {Map<string, string>} importMapEntries
   */
  static async resolveBuildEntries (jsFiles, importMapEntries) {
    await init
    /** @type {Map<string, string>} */
    const map = new Map()
    const promises = []
    for (const [moduleSpecifier, modulePath] of importMapEntries) {
      if (!jsFiles.has(path.resolve(modulePath))) {
        continue
      }
      map.set(moduleSpecifier, modulePath)
      promises.push(this.processJsFile(modulePath, importMapEntries, map))
    }
    await Promise.all(promises)
    return map
  }

  /**
   * Process the given JS file and add its dependencies to build entries
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
   * Generate import map tags
   * @param {Map<string, string>} buildEntries
   */
  static generateImportMapTags (buildEntries) {
    const entriesWithAssetUrl = this.getEntriesWithAssetUrl(buildEntries)
    return [this.generateImportMapTag(entriesWithAssetUrl), ...this.generateModulePreloadTags(entriesWithAssetUrl)].join('\n')
  }

  /**
   * Get import map entries with asset URLs
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
   * Generate the tag for the import map
   * @param {Map<string, string>} entriesWithAssetUrl
   */
  static generateImportMapTag (entriesWithAssetUrl) {
    return `<script type="importmap">\n${JSON.stringify({ imports: Object.fromEntries(entriesWithAssetUrl) }, null, 2)}\n</script>`
  }

  /**
   * Generate module preload tags for the entries in the import map
   * @param {Map<string, string>} entriesWithAssetUrl
   */
  static generateModulePreloadTags (entriesWithAssetUrl) {
    return [...entriesWithAssetUrl.values()].map(modulePath => `<link rel="modulepreload" href="${modulePath}">`)
  }

  /**
   * Get the asset URL for a given asset path
   * @param {string} assetPath
   */
  static assetUrl (assetPath) {
    return `{{ '${path.basename(assetPath)}' | asset_url }}`
  }

  /**
   * Filter build entries by excluding component JS entry points
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
