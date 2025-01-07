import { globSync } from 'glob'
import * as fs from 'node:fs'
import path from 'node:path'

import { LiquidNode } from './types.js'

const LIQUID_BLOCK_REGEX = /{%-?.*?-?%}/gs
const LIQUID_COMMENTS_REGEX = /{%-?\s*comment\s*-?%}[\S\s]*?{%-?\s*endcomment\s*-?%}/gi
const LIQUID_RENDER_REGEX = /\srender\s+'([^']+)'/gs

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

export function generateLiquidNode(file: string, type: LiquidNode['type'], themeFolder: LiquidNode['themeFolder']): LiquidNode {
  let assets: string[] = []
  let body: string = ''
  let snippets: string[] = []
  let setup: string[] = []

  if (type !== 'asset') {
    body = fs.readFileSync(file, 'utf8')
    snippets = getSnippetNames(body)
  }

  if (type === 'component') {
    assets = globSync(path.join(path.dirname(file), 'assets', '**/*'), { absolute: true }).map(asset => path.basename(asset))
    setup = globSync(path.join(path.dirname(file), 'setup', '**/*'), { absolute: true }).map(asset => path.relative(path.join(path.dirname(file), 'setup'), asset))
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

export function getCollectionNodes(collectionDir: string): LiquidNode[] {
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

  const collectionSetup = globSync(path.join(collectionDir, 'components', '*', 'setup', '*/*'), { absolute: true })
    .map(file => {
      const parentFolderName = path.basename(path.dirname(file)) as LiquidNode['themeFolder']
      return generateLiquidNode(file, 'setup', parentFolderName)
    })

  return [...collectionSnippets, ...collectionComponents, ...collectionAssets, ...collectionSetup]
}

export function getThemeNodes(themeDir: string): LiquidNode[] {
  const entryNodes = globSync(path.join(themeDir, '{layout,sections,blocks,templates}', '*.liquid'), { absolute: true })
    .map(file => { 
      const parentFolderName = path.basename(path.dirname(file)) as LiquidNode['themeFolder']
      return generateLiquidNode(file, 'entry', parentFolderName)
    })
  const themeSnippets = globSync(path.join(themeDir, 'snippets', '*.liquid'), { absolute: true })
    .map(file => generateLiquidNode(file, 'snippet', 'snippets'))
  const themeAssets = globSync(path.join(themeDir, 'assets', '*'), { absolute: true })
    .map(file => generateLiquidNode(file, 'asset', 'assets'))
  return [...entryNodes, ...themeSnippets, ...themeAssets]
}
