import path, { join } from 'node:path'
import glob from 'fast-glob'
import picomatch from 'picomatch'
import { init, parse } from 'es-module-lexer'
import { exists, getFileContents, getJsonFileContents } from '../utils/fileUtils.js'
import { isUrl } from '../utils/webUtils.js'
import FileMissingError from '../errors/FileMissingError.js'

class ImportMapProcessor {
  static ImportMapFile = 'importmap.json'

  /**
   * Build import map file and return build entries
   * @param {string[]} jsFiles
   * @param {string} collectionRootFolder
   * @returns {Promise<{entries: Map<string, string>, tags: string}>}
   */
  static async build(jsFiles, collectionRootFolder) {
    const importMapFile = join(collectionRootFolder, this.ImportMapFile)
    const jsFilesSet = new Set(jsFiles)

    if (!(await exists(importMapFile))) {
      throw new FileMissingError('ImportMap file not found, unable to process javascript')
    }

    const importMap = {}
    /** @type {{imports: Object<string, string>}} */
    const importMapJson = await getJsonFileContents(importMapFile)
    const importMapEntries = this.resolveImportMapEntries(importMapJson.imports, collectionRootFolder)
    const buildEntries = await this.resolveBuildEntries(jsFilesSet, importMapEntries)
    const sortedBuildEntries = new Map([...buildEntries.entries()].sort())
    importMap.tags = this.generateImportMapTags(sortedBuildEntries)
    importMap.entries = this.filterBuildEntries(sortedBuildEntries, jsFilesSet)
    return importMap
  }

  /**
   * Resolve import map entries
   * @param {Object<string, string>} imports
   * @param {string} collectionRootFolder
   */
  static resolveImportMapEntries(imports, collectionRootFolder) {
    /** @type {Map<string, string>} */
    const map = new Map()
    const entries = Object.entries(imports)
    const {includePatterns, ignorePatterns} = this.resolveGlobPatterns(entries)
    const files = glob.sync(includePatterns, {
      ignore: ignorePatterns,
      cwd: collectionRootFolder,
      absolute: true
    })

    for (const [specifierPattern, modulePattern] of entries) {
      if (isUrl(modulePattern)) {
        map.set(specifierPattern, modulePattern)
        continue
      }

    

      const filteredFiles = files.filter((file) => {
        if (Array.isArray(modulePattern)) {
          let isMatch = false;
          modulePattern.forEach(value => {
              if (!value.startsWith('!')) {
                isMatch = isMatch || picomatch.isMatch(file, path.resolve(collectionRootFolder, value))
              } 
          });
          return isMatch
        } else {
          return picomatch.isMatch(file, path.resolve(collectionRootFolder, modulePattern))
        }
      }
        
      )
      for (const file of filteredFiles) {
        map.set(this.getModuleSpecifier(file, specifierPattern), file)
      }
    }
    return map
  }

  /**
   * Resolve glob include and ignore patterns from import map entries
   * @param {[string, string|Array<string>][]} entries
   * @returns {{ includePatterns: string[], ignorePatterns: string[] }}
   */
  static resolveGlobPatterns(entries) {
    const includePatterns = [];
    const ignorePatterns = [];

    entries.forEach(([key, values]) => {
      if (Array.isArray(values)) {
        values.forEach(value => {
          if (!isUrl(value)) {
            if (value.startsWith('!')) {
              ignorePatterns.push(value);
            } else {
              includePatterns.push(value);
            }
          }
        });
      } else {
        includePatterns.push(values);
      }
    });

    return { includePatterns, ignorePatterns };
  }

  /**
   * Get the module specifier for a given JS file
   * @param {string} file
   * @param {string} specifierPattern
   */
  static getModuleSpecifier(file, specifierPattern) {
    return specifierPattern.replace(/\*$/, path.parse(file).name)
  }

  /**
   * Resolve build entries from component JS entry points
   * @param {Set<string>} jsFiles
   * @param {Map<string, string>} importMapEntries
   */
  static async resolveBuildEntries(jsFiles, importMapEntries) {
    await init
    /** @type {Map<string, string>} */
    const map = new Map()
    // const promises = []
    for (const [moduleSpecifier, modulePath] of importMapEntries) {
      // TODO 
      // if (!jsFiles.has(path.resolve(modulePath))) {
      //   continue
      // }
      map.set(moduleSpecifier, modulePath)
      // promises.push(this.processJsFile(modulePath, importMapEntries, map))
    }
    // await Promise.all(promises)
    return map
  }

  /**
   * Process the given JS file and add its dependencies to build entries
   * @param {string} file
   * @param {Map<string, string>} importMapEntries
   * @param {Map<string, string>} buildEntries
   */
  static async processJsFile(file, importMapEntries, buildEntries) {
    const fileContents = await getFileContents(file)
    const [imports] = parse(fileContents)
    const promises = []
    for (const element of imports) {
      const moduleSpecifier = element.n
      if (!moduleSpecifier) continue
      const modulePath = importMapEntries.get(moduleSpecifier)
      if (!modulePath) continue
      if (isUrl(modulePath)) {
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
   * @returns {string}
   */
  static generateImportMapTags(buildEntries) {
    const entriesWithAssetUrl = this.getEntriesWithAssetUrl(buildEntries)
    return [this.generateImportMapTag(entriesWithAssetUrl)].join('\n')
  }

  /**
   * Get import map entries with asset URLs
   * @param {Map<string, string>} buildEntries
   */
  static getEntriesWithAssetUrl(buildEntries) {
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
  static generateImportMapTag(entriesWithAssetUrl) {
    return `<script type="importmap">\n${JSON.stringify({ imports: Object.fromEntries(entriesWithAssetUrl) }, null, 2)}\n</script>`
  }

  /**
   * Generate module preload tags for the entries in the import map
   * @param {Map<string, string>} entriesWithAssetUrl
   */
  static generateModulePreloadTags(entriesWithAssetUrl) {
    return [...entriesWithAssetUrl.values()].map((modulePath) => `<link rel="modulepreload" href="${modulePath}">`)
  }

  /**
   * Get the asset URL for a given asset path
   * @param {string} assetPath
   */
  static assetUrl(assetPath) {
    return `{{ '${path.basename(assetPath)}' | asset_url }}`
  }

  /**
   * Filter build entries by excluding component JS entry points
   * @param {Map<string, string>} buildEntries
   * @param {Set<string>} jsFiles
   * @returns {Map<string, string>}
   */
  static filterBuildEntries(buildEntries, jsFiles) {
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
