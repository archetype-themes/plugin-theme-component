import {glob,globSync} from 'glob'
import fs from 'node:fs'
import path from 'node:path'

import {
  themeComponentConfig
} from './config.js'
import {cloneTheme} from './git.js'
import {
  LiquidNode,
} from './types.js'
import logger from './logger.js'

const LIQUID_BLOCK_REGEX = /{%-?.*?-?%}/gs
const LIQUID_COMMENTS_REGEX = /{%-?\s*comment\s*-?%}[\S\s]*?{%-?\s*endcomment\s*-?%}/gi
const LIQUID_RENDER_REGEX = /\srender\s+'([^']+)'/gs

export function getSnippetNames(liquidCode: string) {
  const cleanLiquidCode = liquidCode.replaceAll(LIQUID_COMMENTS_REGEX, '')

  const snippetNames = new Set<string>()
  for (const block of cleanLiquidCode.matchAll(LIQUID_BLOCK_REGEX)) {
    for (const renderMatch of block[0].matchAll(LIQUID_RENDER_REGEX)) {
      snippetNames.add(renderMatch[1])
    }
  }

  return [...snippetNames]
}

export async function listSnippetsToCopy(
  themePath: string, 
  componentsDir: string
): Promise<Set<LiquidNode>> {
  const entryPoints = await listThemeEntryPoints(themePath);
  const allCollectionSnippets = await listComponentCollectionSnippets(componentsDir)
  const renderedCollectionSnippets = listRenderedSnippets(entryPoints, allCollectionSnippets)
  const themeSnippets = await listThemeSnippets(themePath)
  const importMap = themeComponentConfig.IMPORTMAP
  const collectionName = await themeComponentConfig.COLLECTION_NAME
  const snippetsToCopy =    new Set<LiquidNode>();
  
  for (const snippet of renderedCollectionSnippets) {
    const importMapEntry = importMap?.[snippet.name];
    if (importMapEntry === collectionName || importMapEntry !== '@theme' || (!importMapEntry && !themeSnippets.has(snippet))) {
      logger.debug(`Adding snippet ${snippet.name} to copy`)  
      snippetsToCopy.add(snippet);
    } else {
      logger.debug(`Skipping snippet ${snippet.name}`)
    }
  }

  return snippetsToCopy;
}

export function isThemeDirectory(directory: string): boolean {
  const requiredFolders = ['sections', 'layout', 'config', 'templates', 'snippets', 'assets']

  for (const folder of requiredFolders) {
    if (!fs.existsSync(path.join(directory, folder))) {
      return false
    }
  }

  return true
}

export async function listThemeEntryPoints(directory: string): Promise<Set<LiquidNode>> {
  const entryPoints = new Set<LiquidNode>()

  for (const dir of themeComponentConfig.THEME_DIRECTORIES) {
    const files = glob.sync(path.join(dir, '**/*.liquid'), {cwd: directory})
    for (const file of files) {
      const contents = fs.readFileSync(path.join(directory, file), 'utf8')
      entryPoints.add({
        body: contents,
        file,
        name: path.basename(file, '.liquid'),
        snippets: getSnippetNames(contents),
        type: dir.replace(/s$/, '') as 'block' | 'layout' | 'section' | 'template'
      })
    }
  }

  return entryPoints
}

export async function listThemeSnippets(directory: string): Promise<Set<LiquidNode>> {
  const snippets = new Set<LiquidNode>()
  const files = await glob('snippets/*.liquid', {cwd: directory})

  for (const file of files) {
    const contents = fs.readFileSync(path.join(directory, file), 'utf8')
    snippets.add({
      body: contents,
      file,
      name: path.basename(file, '.liquid'),
      snippets: getSnippetNames(contents),
      type: 'snippet'
    })
  }

  return snippets
}

export function listRenderedSnippets(entryPoints: Set<LiquidNode>, snippets: Set<LiquidNode>): Set<LiquidNode> {
  const renderedSnippets = new Set<LiquidNode>()

  function addRenderedSnippets(node: LiquidNode) {
    if (renderedSnippets.has(node)) {
      return
    }

    if (node.type === 'snippet') {
      renderedSnippets.add(node)
    }

    for (const snippetName of node.snippets) {
      const snippet = [...snippets].find(snippet => snippet.name === snippetName)
      if (snippet) {
        addRenderedSnippets(snippet)
      }
    }
  }

  for (const entryPoint of entryPoints) {
    addRenderedSnippets(entryPoint)
  }

  return renderedSnippets
}

export async function listComponentCollectionSnippets(directory: string): Promise<Set<LiquidNode>> {
  const snippets = new Set<LiquidNode>()
  const duplicateFiles: Record<string, string[]> = {}

  const componentDirs = await glob('*/', {cwd: directory})
  const componentFiles = await Promise.all(
    componentDirs.map(async componentName => {
      try {
        const filesToProcess = [
          path.join(componentName, `${componentName}.liquid`),
          ...await glob(path.join(componentName, 'snippets', '*.liquid'), {cwd: directory}).catch(() => [])
        ]
        return {componentName, filesToProcess}
      } catch {
        return {componentName, filesToProcess: []}
      }
    })
  )

  for (const {componentName, filesToProcess} of componentFiles) {
    for (const file of filesToProcess) {
      const relativePath = path.join(componentName, file.includes('snippets') ? 'snippets' : '', path.basename(file))
      const contents = fs.readFileSync(path.join(directory, relativePath), 'utf8')
      const snippetNode = {
        body: contents,
        file: relativePath,
        name: path.basename(file, '.liquid'),
        snippets: getSnippetNames(contents),
        type: 'snippet'
      }

      const existingSnippet = [...snippets].find(snippet => snippet.name === snippetNode.name)
      if (existingSnippet) {
        duplicateFiles[snippetNode.name] = duplicateFiles[snippetNode.name] || []
        duplicateFiles[snippetNode.name].push(existingSnippet.file, relativePath)
      } else {
        snippets.add(snippetNode as LiquidNode)
      }
    }
  }

  if (Object.keys(duplicateFiles).length > 0) {
    throw new Error(
      'Duplicate snippet names found. Please rename:\n' +
      Object.entries(duplicateFiles)
        .map(([key, paths]) => `${key}:\n  ${paths.join('\n  ')}`)
        .join('\n')
    )
  }

  return snippets
}

export function copySetupFiles(
  componentsDir: string,
  themeDir: string,
  componentSelector: string
): void {
  const setupFiles = globSync(path.join(componentSelector, 'setup', '**/*'), {cwd: componentsDir})
  
  for (const file of setupFiles) {
    const sourcePath = path.join(componentsDir, file)
    const destinationPath = path.join(themeDir, path.basename(path.dirname(file)), path.basename(file))
    
    // Create directory if it doesn't exist
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true })
    
    // Copy file or directory
    if (fs.statSync(sourcePath).isDirectory()) {
      fs.mkdirSync(destinationPath, { recursive: true })
    } else {
      copyChangedFiles(sourcePath, destinationPath)
    }
  }
}

export function copySnippetsAndAssets(
  snippetsToCopy: Set<LiquidNode>,
  themePath: string,
  componentsDir: string,
): Set<LiquidNode> {
  const copiedFiles = new Set<LiquidNode>()
  
  // Create snippets directory if it doesn't exist
  const snippetsDir = path.join(themePath, 'snippets')
  fs.mkdirSync(snippetsDir, { recursive: true })
  
  for (const snippet of snippetsToCopy) {
    // Copy the snippet file
    const sourcePath = path.join(componentsDir, snippet.file)
    const destinationPath = path.join(themePath, 'snippets', path.basename(snippet.file))
    
    if (!fs.existsSync(sourcePath)) {
      logger.debug(`Skipping missing file: ${sourcePath}`)
      continue
    }
    
    copyChangedFiles(sourcePath, destinationPath)
    copiedFiles.add(snippet)

    // Check for and copy associated assets
    const snippetName = snippet.name
    const componentAssetsPath = path.join(componentsDir, snippetName, 'assets')
    if (fs.existsSync(componentAssetsPath)) {
      const themeAssetsPath = path.join(themePath, 'assets')
      fs.mkdirSync(themeAssetsPath, { recursive: true })
      
      const assetFiles = globSync('**/*', { cwd: componentAssetsPath })
      for (const assetFile of assetFiles) {
        const assetSource = path.join(componentAssetsPath, assetFile)
        const assetDest = path.join(themeAssetsPath, assetFile)
        
        if (!fs.existsSync(assetSource)) {
          logger.debug(`Skipping missing asset: ${assetSource}`)
          continue
        }
        
        fs.mkdirSync(path.dirname(assetDest), { recursive: true })
        copyChangedFiles(assetSource, assetDest)
        copiedFiles.add({
          body: '',
          file: path.join('assets', assetFile),
          name: path.basename(assetFile, path.extname(assetFile)),
          snippets: [],
          type: 'asset'
        } as LiquidNode)
      }
    }
  }

  return copiedFiles
}

export async function copyComponents(componentSelector: string, themeDir: string): Promise<Set<LiquidNode>> {
  const componentsDir = path.join(process.cwd(), themeComponentConfig.COLLECTION_COMPONENT_DIR)

  // Copy setup files first
  if (themeComponentConfig.COPY_SETUP_FILES) {
    copySetupFiles(componentsDir, themeDir, componentSelector)
  }

  // Filter snippets to copy based on import map and theme snippets
  const snippetsToCopy = await listSnippetsToCopy(themeDir, componentsDir)
  
  // Copy filtered snippets and their assets, and return the copied files
  return copySnippetsAndAssets(snippetsToCopy, themeDir, componentsDir)
}

export async function copyTheme(source: string, destination: string): Promise<void> {
  if (source.startsWith('https://')) {
    await cloneTheme(source, destination)
  } else {
    copyChangedFiles(source, destination)
  }
}

function copyChangedFiles(source: string, destination: string): void {
  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source, { withFileTypes: true })
    for (const file of files) {
      if (file.name.startsWith('.') || file.name === '.git') {
        continue
      }
      const sourcePath = path.join(source, file.name)
      const destinationPath = path.join(destination, file.name)
      copyChangedFiles(sourcePath, destinationPath)
    }
  } else {
    if (!fs.existsSync(destination) || !fs.readFileSync(source).equals(fs.readFileSync(destination))) {
      fs.mkdirSync(path.dirname(destination), { recursive: true })
      fs.copyFileSync(source, destination)
    }
  }
}