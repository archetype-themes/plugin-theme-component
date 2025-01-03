import {glob,globSync} from 'glob'
import fs from 'node:fs'
import path from 'node:path'
import {parse, stringify} from 'smol-toml'

import config from './config.js'
import {cloneTheme} from './git.js'

interface ThemeConfig {
  components: {
    collections: Record<string, {
      repository: string;
      version: string;
    }>;
    importmap: Record<string, string>;
  };
}

interface LiquidNode {
  body: string
  file: string 
  name: string
  snippets: string[]
  type: 'asset' | 'block' | 'layout' | 'section' | 'snippet' | 'template'
}

const LIQUID_BLOCK_REGEX = /{%-?.*?-?%}/gs
const LIQUID_COMMENTS_REGEX = /{%-?\s*comment\s*-?%}[\S\s]*?{%-?\s*endcomment\s*-?%}/gi
const LIQUID_RENDER_REGEX = /\srender\s+'([^']+)'/gs

interface PackageJSON {
  name: string;
  repository: string;
  version: string;
}

export function getThemeConfig(configFilePath: string): ThemeConfig {
  const configContent = fs.readFileSync(configFilePath, 'utf8')
  const parsed = parse(configContent) as unknown as ThemeConfig

  return {
    components: {
      collections: parsed.components?.collections || {},
      importmap: parsed.components?.importmap || {}
    }
  }
}

export function updateThemeCollection(configFilePath: string, pkg: PackageJSON): void {
  const config = getThemeConfig(configFilePath)
  config.components.collections[pkg.name] = {repository: pkg.repository, version: pkg.version}
  const updatedConfigContent = stringify(config)
  fs.writeFileSync(configFilePath, updatedConfigContent, 'utf8')
}

export function updateSnippetImportMap(configFilePath: string, snippets: Set<LiquidNode>, collectionName: string): void {
  const config = getThemeConfig(configFilePath)
  const importMap = { ...config.components.importmap }
  
  for (const snippet of snippets) {
    importMap[snippet.name] = collectionName
  }
  
  config.components.importmap = importMap
  const updatedConfigContent = stringify(config)
  fs.writeFileSync(configFilePath, updatedConfigContent, 'utf8')
}

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
  componentsDir: string, 
  configFilePath: string,
  collectionName: string
): Promise<Set<LiquidNode>> {
  const entryPoints = await listThemeEntryPoints(themePath);
  const allCollectionSnippets = await listComponentCollectionSnippets(componentsDir)
  const renderedCollectionSnippets = listRenderedSnippets(entryPoints, allCollectionSnippets)
  const themeSnippets = await listThemeSnippets(themePath)
  const config = await getThemeConfig(configFilePath)
  const importMap = config?.components?.importmap

  const snippetsToCopy = new Set<LiquidNode>();
  for (const snippet of renderedCollectionSnippets) {
    const importMapEntry = importMap?.[snippet.name];
    if (importMapEntry === collectionName || importMapEntry !== '@theme' || (!importMapEntry && !themeSnippets.has(snippet))) {
      snippetsToCopy.add(snippet);
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
  const themeDirectories = ['layout', 'sections', 'templates', 'blocks'] as const
  const entryPoints = new Set<LiquidNode>()

  
  for (const dir of themeDirectories) {
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

export async function getCollectionInfo(): Promise<PackageJSON> {
  const pkg = JSON.parse(await fs.promises.readFile(config.COLLECTION_PACKAGE_JSON, 'utf8'));
  return {
    name: pkg.name,
    repository: pkg.repository,
    version: pkg.version
  };
}

export function copySetupFiles(
  componentsDir: string,
  themeDir: string,
  componentSelector: string
): void {
  const setupFiles = globSync(path.join(componentSelector, 'setup', '**/*'), {cwd: componentsDir})
  
  for (const file of setupFiles) {
    const sourcePath = path.join(componentsDir, file)
    const destinationPath = path.join(themeDir, path.basename(file))
    fs.copyFileSync(sourcePath, destinationPath)
  }
}

export function copySnippetsAndAssets(
  snippetsToCopy: Set<LiquidNode>,
  themePath: string,
  componentsDir: string,
): Set<LiquidNode> {
  const copiedFiles = new Set<LiquidNode>()
  
  for (const snippet of snippetsToCopy) {
    const sourcePath = path.join(componentsDir, snippet.file)
    const destinationPath = path.join(themePath, 'snippets', path.basename(snippet.file))
    fs.copyFileSync(sourcePath, destinationPath)
    copiedFiles.add(snippet)
  }

  return copiedFiles
}

export async function copyComponents(componentSelector: string, themeDir: string): Promise<Set<LiquidNode>> {
  const componentsDir = path.join(process.cwd(), config.COLLECTION_COMPONENT_DIR)

  // Copy setup files first
  if (config.COPY_SETUP_FILES) {
    copySetupFiles(componentsDir, themeDir, componentSelector)
  }

  // Get config and package info
  const configFilePath = path.join(path.resolve(process.cwd(), themeDir), config.THEME_CLI_CONFIG)
  const pkg = await getCollectionInfo()
  const collectionName = config.COLLECTION_NAME || pkg.name

  // Filter snippets to copy based on import map and theme snippets
  const snippetsToCopy = await listSnippetsToCopy(themeDir, componentsDir, configFilePath, collectionName)
  
  // Copy filtered snippets and their assets, and return the copied files
  return copySnippetsAndAssets(snippetsToCopy, themeDir, componentsDir)
}

export async function copyTheme(source: string, destination: string): Promise<void> {
  if (fs.existsSync(destination)) {
    fs.rmSync(destination, {recursive: true})
  }

  if (source.startsWith('https://')) {
    await cloneTheme(source, destination)
  } else {
    fs.cpSync(source, destination, {recursive: true})
  }
}

export async function updateThemeConfig(filesCopied: Set<LiquidNode>, themeDir: string): Promise<void> {
  const configFilePath = path.join(themeDir, config.THEME_CLI_CONFIG)
  const pkg = await getCollectionInfo()
  const collectionName = config.COLLECTION_NAME || pkg.name
  
  updateThemeCollection(configFilePath, pkg)
  updateSnippetImportMap(configFilePath, filesCopied, collectionName)
}