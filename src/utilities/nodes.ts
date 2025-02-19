import { globSync } from 'glob'
import * as fs from 'node:fs'
import path from 'node:path'
import { parseImports } from 'parse-imports'

import { LiquidNode } from './types.js'

const LIQUID_BLOCK_REGEX = /{%-?.*?-?%}/gs
const LIQUID_COMMENTS_REGEX = /{%-?\s*comment\s*-?%}[\S\s]*?{%-?\s*endcomment\s*-?%}/gi
const LIQUID_RENDER_REGEX = /\srender\s+'([^']+)'/gs
const ASSET_URL_REGEX = /{{\s*'([^']+\.js)'\s*\|\s*asset_url\s*}}/g
const SCRIPT_TAG_REGEX = /<script[^>]*>[\S\s]*?<\/script>/g
const SCRIPT_IMPORT_REGEX = /import\s+["']([^"']+)["']/g

export function getSnippetNames(liquidCode: string) {
  const cleanLiquidCode = liquidCode.replaceAll(LIQUID_COMMENTS_REGEX, '')

  const snippetNames = new Set<string>()
  for (const block of cleanLiquidCode.matchAll(LIQUID_BLOCK_REGEX)) {
    for (const renderMatch of block[0].matchAll(LIQUID_RENDER_REGEX)) {
      snippetNames.add(`${renderMatch[1]}.liquid`)
    }
  }

  return [...snippetNames]
}

export function getJsImportsFromLiquid(liquidCode: string) {
  const cleanLiquidCode = liquidCode.replaceAll(LIQUID_COMMENTS_REGEX, '')
  const jsImports = new Set<string>()

  // Match any JS files referenced with the asset_url filter
  for (const match of cleanLiquidCode.matchAll(ASSET_URL_REGEX)) {
    jsImports.add(match[1])
  }

  // Match import statements within script tags
  const scriptTags = cleanLiquidCode.match(SCRIPT_TAG_REGEX) || []
  for (const scriptTag of scriptTags) {
    for (const match of scriptTag.matchAll(SCRIPT_IMPORT_REGEX)) {
      const importPath = match[1]

      // Add both .js and .min.js versions of the import to look for both
      jsImports.add(importPath.endsWith('.js') ? importPath : `${importPath}.js`)
      jsImports.add(importPath.endsWith('.min.js') ? importPath : `${importPath}.min.js`)
    }
  }

  return [...jsImports]
}

export async function generateLiquidNode(file: string, type: LiquidNode['type'], themeFolder: LiquidNode['themeFolder']): Promise<LiquidNode> {
  let assets: string[] = []
  let body: string = ''
  let snippets: string[] = []
  let setup: string[] = []

  if (type !== 'asset') {
    body = fs.readFileSync(file, 'utf8')
    snippets = getSnippetNames(body)
  }

  if (type === 'asset' && path.basename(file).endsWith('.js')) {
    body = fs.readFileSync(file, 'utf8')
    assets = await getJsAssets(body)
  }

  if (type === 'snippet') { 
    body = fs.readFileSync(file, 'utf8')
    assets = getJsImportsFromLiquid(body)
  }

  if (type === 'component') {
    body = fs.readFileSync(file, 'utf8')
    const jsImports = getJsImportsFromLiquid(body)
    const globbedAssets = globSync(path.join(path.dirname(file), 'assets', '**/*'), { absolute: true }).map(asset => path.basename(asset))
    assets = [...new Set([...jsImports, ...globbedAssets])]
    setup = globSync(path.join(path.dirname(file), 'setup', '**/*'), { absolute: true })
      .filter(file => !fs.statSync(file).isDirectory())
  }

  return {
    assets,
    body,
    file,
    name: path.basename(file),
    setup,
    snippets,
    themeFolder,
    type
  }
}

export async function getCollectionNodes(collectionDir: string): Promise<LiquidNode[]> {
  const collectionSnippets = globSync(path.join(collectionDir, 'components', '*', 'snippets', '*.liquid'), { absolute: true })
    .map(file => generateLiquidNode(file, 'snippet', 'snippets'))
  const collectionComponents = globSync(path.join(collectionDir, 'components', '*', '*.liquid'), { absolute: true })
    .filter(file => {
      const parentFolder = path.basename(path.dirname(file));
      const fileName = path.basename(file, '.liquid');
      return parentFolder === fileName;
    })
    .map(file => generateLiquidNode(file, 'component', 'snippets'))
  const collectionAssets = globSync(path.join(collectionDir, 'components', '*', 'assets', '*'), { absolute: true })
    .map(file => generateLiquidNode(file, 'asset', 'assets'))
  const collectionScripts = globSync(path.join(collectionDir, 'scripts', '*.js'), { absolute: true })
    .map(file => generateLiquidNode(file, 'asset', 'assets'))

  const collectionSetup = globSync(path.join(collectionDir, 'components', '*', 'setup', '*/*'), { absolute: true })
    .filter(file => !fs.statSync(file).isDirectory())
    .map(file => {
      const parentFolderName = path.basename(path.dirname(file)) as LiquidNode['themeFolder']
      return generateLiquidNode(file, 'setup', parentFolderName)
    })

  return Promise.all([...collectionSnippets, ...collectionComponents, ...collectionAssets, ...collectionScripts, ...collectionSetup])
}

export async function getThemeNodes(themeDir: string): Promise<LiquidNode[]> {
  const entryNodes = globSync(path.join(themeDir, '{layout,sections,blocks,templates}', '*.liquid'), { absolute: true })
    .map(file => { 
      const parentFolderName = path.basename(path.dirname(file)) as LiquidNode['themeFolder']
      return generateLiquidNode(file, 'entry', parentFolderName)
    })
  const themeSnippets = globSync(path.join(themeDir, 'snippets', '*.liquid'), { absolute: true })
    .map(file => generateLiquidNode(file, 'snippet', 'snippets'))
  const themeAssets = globSync(path.join(themeDir, 'assets', '*'), { absolute: true })
    .map(file => generateLiquidNode(file, 'asset', 'assets'))
  return Promise.all([...entryNodes, ...themeSnippets, ...themeAssets])
}

export async function getJsAssets(body: string) {
  const imports = [...(await parseImports(body))]
  return imports.flatMap((imp) => {
    if (!imp.moduleSpecifier?.value) return []
    const value = imp.moduleSpecifier.value.endsWith('.js')
      ? imp.moduleSpecifier.value
      : `${imp.moduleSpecifier.value}.js`
    const basename = path.basename(value)
    const minBasename = basename.replace('.js', '.min.js')
    return [basename, minBasename]
  })
}
