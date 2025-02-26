import fs, { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { cloneTheme } from './git.js'
import { flattenObject, sortObjectKeys, unflattenObject } from './objects.js'
import { CleanOptions, LocaleContent, LocaleDiff, LocaleOptions, SyncOptions, ThemeTranslations } from './types.js'

const SCHEMA_DIRS = ['config', 'blocks', 'sections'] as const
const STOREFRONT_DIRS = ['blocks', 'layout', 'sections', 'snippets', 'templates'] as const

export async function getLocaleSource(source: string): Promise<LocaleContent> {
  if (isUrl(source)) {
    return fetchRemoteLocales(source)
  }

  return loadLocalLocales(source)
}

function isUrl(source: string): boolean {
  return source.startsWith('http://') || source.startsWith('https://')
}

async function fetchRemoteLocales(url: string): Promise<LocaleContent> {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'theme-locales-'))

  try {
    await cloneTheme(url, tempDir)
    return loadLocalLocales(path.join(tempDir, 'locales'))
  } finally {
    rmSync(tempDir, { force: true, recursive: true })
  }
}

function loadLocalLocales(dir: string): LocaleContent {
  const content: LocaleContent = {}
  const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'))

  for (const file of files) {
    const filePath = path.join(dir, file)
    content[file] = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }

  return content
}

export function writeLocaleFile(
  filePath: string,
  content: Record<string, unknown>,
  options?: LocaleOptions
): void {
  const formattedContent = options?.format ? sortObjectKeys(content) : content
  fs.writeFileSync(filePath, JSON.stringify(formattedContent, null, 2) + '\n')
}

export function getThemeTranslations(themeDir: string): ThemeTranslations {
  return {
    schema: scanFiles(themeDir, SCHEMA_DIRS, findSchemaKeys),
    storefront: scanFiles(themeDir, STOREFRONT_DIRS, findStorefrontKeys)
  }
}

function scanFiles(themeDir: string, dirs: readonly string[], findKeys: (content: string) => Set<string>): Set<string> {
  const usedKeys = new Set<string>()

  for (const dir of dirs) {
    const dirPath = path.join(themeDir, dir)
    if (!fs.existsSync(dirPath)) continue

    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.liquid') || file.endsWith('.json'))

    for (const file of files) {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf8')
      const keys = findKeys(content)
      for (const key of keys) {
        usedKeys.add(key)
      }
    }
  }

  return usedKeys
}

function findSchemaKeys(content: string): Set<string> {
  const keys = new Set<string>()
  const matches = content.match(/"t:([^"]+)"/g) || []

  for (const match of matches) {
    const key = match.match(/"t:([^"]+)"/)![1]
    keys.add(key)
  }

  return keys
}

function findStorefrontKeys(content: string): Set<string> {
  const keys = new Set<string>()

  // Standard Liquid translation patterns
  const standardPatterns = [
    /{{\s*-?\s*["']([^"']+)["']\s*\|\s*t[^}]*-?\s*}}/g,
    /{%\s*(?:assign|capture)\s+\w+\s*=\s*["']([^"']+)["']\s*\|\s*t[^%]*%}/g,
    /(?:^|\s)["']([^"']+)["']\s*\|\s*t[^\n}]*/gm,
  ]

  // Find standard translations
  for (const pattern of standardPatterns) {
    const matches = content.match(pattern) || []
    for (const match of matches) {
      const key = match.match(/["']([^"']+)["']/)![1]
      keys.add(key)
    }
  }

  // Combine with t_with_fallback translations
  return new Set([...keys, ...findTWithFallbackKeys(content)])
}

function findTWithFallbackKeys(content: string): Set<string> {
  // Find translations assigned to variables first
  const assignedTranslations = findAssignedTranslations(content)

  // Find both direct keys and variable-based keys
  const directKeys = findDirectFallbackKeys(content)
  const variableKeys = findVariableFallbackKeys(content, assignedTranslations)

  return new Set([...directKeys, ...variableKeys])
}

function findAssignedTranslations(content: string): Map<string, string> {
  const assignments = new Map<string, string>()
  const pattern = /{%-?\s*assign\s+([^\s=]+)\s*=\s*["']([^"']+)["']\s*\|\s*t[^%]*-?%}/g

  const matches = content.matchAll(pattern)
  for (const match of matches) {
    const [, varName, translationKey] = match
    assignments.set(varName, translationKey)
  }

  return assignments
}

function findDirectFallbackKeys(content: string): Set<string> {
  const keys = new Set<string>()
  const pattern = /render\s+["']t_with_fallback["'][^%]*key:\s*["']([^"']+)["']/g

  const matches = content.matchAll(pattern)
  for (const match of matches) {
    keys.add(match[1])
  }

  return keys
}

function findVariableFallbackKeys(content: string, assignedTranslations: Map<string, string>): Set<string> {
  const keys = new Set<string>()
  const pattern = /render\s+["']t_with_fallback["'][^%]*t:\s*([^\s,}]+)/g

  const matches = content.matchAll(pattern)
  for (const match of matches) {
    const varName = match[1]
    const translationKey = assignedTranslations.get(varName)
    if (translationKey) {
      keys.add(translationKey)
    }
  }

  return keys
}

export async function removeUnusedTranslations(
  themeDir: string,
  options: CleanOptions = {}
): Promise<void> {
  const { format, target = 'all' } = options;
  const formatOptions: LocaleOptions = { format };

  switch (target) {
    case 'schema': {
      await cleanSchemaTranslations(themeDir, formatOptions)
      break
    }

    case 'storefront': {
      await cleanStorefrontTranslations(themeDir, formatOptions)
      break
    }

    case 'all': {
      await cleanSchemaTranslations(themeDir, formatOptions)
      await cleanStorefrontTranslations(themeDir, formatOptions)
      break
    }
  }
}

export function cleanSchemaTranslations(themeDir: string, options?: LocaleOptions): void {
  const usedKeys = scanFiles(themeDir, SCHEMA_DIRS, findSchemaKeys)
  const localesDir = path.join(themeDir, 'locales')
  const schemaFiles = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.schema.json'))

  for (const file of schemaFiles) {
    removeUnusedKeysFromFile(path.join(localesDir, file), usedKeys, options)
  }
}

export function cleanStorefrontTranslations(themeDir: string, options?: LocaleOptions): void {
  const usedKeys = scanFiles(themeDir, STOREFRONT_DIRS, findStorefrontKeys)
  const localesDir = path.join(themeDir, 'locales')
  const localeFiles = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.json') && !file.endsWith('.schema.json'))

  for (const file of localeFiles) {
    removeUnusedKeysFromFile(path.join(localesDir, file), usedKeys, options)
  }
}

function removeUnusedKeysFromFile(filePath: string, usedKeys: Set<string>, options?: LocaleOptions): void {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    if (!content || typeof content !== 'object') return

    const flattenedContent = flattenObject(content)
    const cleanedContent: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(flattenedContent)) {
      const basePath = key.split('.').slice(0, -1).join('.')
      if (usedKeys.has(key) || usedKeys.has(basePath)) {
        cleanedContent[key] = value
      }
    }

    const unflattened = unflattenObject(cleanedContent)
    writeLocaleFile(filePath, unflattened, options)
  } catch (error) {
    throw new Error(`Error processing ${path.basename(filePath)}: ${error}`)
  }
}

export async function mergeLocaleFiles(
  themeDir: string,
  sourceLocales: Record<string, Record<string, unknown>>,
  options?: SyncOptions
): Promise<void> {
  const localesDir = path.join(themeDir, 'locales')
  const { format = false, mode = 'add-missing', target = 'all' } = options ?? {}

  const filesToSync = Object.entries(sourceLocales).filter(([file]) => {
    const isSchemaFile = file.endsWith('.schema.json')

    if (target === 'schema') return isSchemaFile
    if (target === 'storefront') return !isSchemaFile
    return true
  })

  for (const [file, sourceContent] of filesToSync) {
    const targetPath = path.join(localesDir, file)

    if (!fs.existsSync(targetPath)) {
      writeLocaleFile(targetPath, sourceContent, { format })
      continue
    }

    const targetContent = JSON.parse(fs.readFileSync(targetPath, 'utf8'))
    const diff = compareLocales(sourceContent, targetContent)

    const mergedContent = mode === 'replace-existing'
      ? replaceTranslations(sourceContent, targetContent)
      : mode === 'add-missing'
        ? addMissingTranslations(sourceContent, targetContent, diff)
        : mergeTranslations(sourceContent, targetContent, diff)

    writeLocaleFile(targetPath, mergedContent, { format })
  }
}

export function compareLocales(source: Record<string, unknown>, target: Record<string, unknown>): LocaleDiff {
  const flatSource = flattenObject(source)
  const flatTarget = flattenObject(target)

  return {
    added: new Set(Object.keys(flatSource).filter(key => !(key in flatTarget))),
    modified: new Set(Object.keys(flatSource).filter(key =>
      key in flatTarget && flatSource[key] !== flatTarget[key]
    )),
    removed: new Set(Object.keys(flatTarget).filter(key => !(key in flatSource))),
  }
}

function replaceTranslations(
  source: Record<string, unknown>,
  target: Record<string, unknown>
): Record<string, unknown> {
  const updateValues = (targetObj: Record<string, unknown>, sourceObj: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(targetObj)) {
      const isNestedObject = typeof value === 'object' && value !== null
      const hasSourceValue = key in sourceObj

      if (isNestedObject && hasSourceValue && typeof sourceObj[key] === 'object') {
        result[key] = updateValues(value as Record<string, unknown>, sourceObj[key] as Record<string, unknown>)
      } else {
        result[key] = hasSourceValue ? sourceObj[key] : value
      }
    }

    return result
  }

  return updateValues(target, source)
}

function addMissingTranslations(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  diff: LocaleDiff
): Record<string, unknown> {
  const merged = { ...target }
  const flatContent = flattenObject(source)
  const flatMerged = flattenObject(merged)

  for (const key of diff.added) {
    flatMerged[key] = flatContent[key]
  }

  return unflattenObject(flatMerged)
}

function mergeTranslations(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  diff: LocaleDiff
): Record<string, unknown> {
  const merged = { ...target }
  const flatContent = flattenObject(source)
  const flatMerged = flattenObject(merged)

  for (const key of [...diff.added, ...diff.modified]) {
    flatMerged[key] = flatContent[key]
  }

  return unflattenObject(flatMerged)
}

export function extractRequiredTranslations(
  sourceLocales: Record<string, Record<string, unknown>>,
  required: ThemeTranslations
): LocaleContent {
  const result: LocaleContent = {}

  for (const [file, content] of Object.entries(sourceLocales)) {
    const isSchema = file.endsWith('.schema.json')
    const requiredKeys = isSchema ? required.schema : required.storefront

    const flatContent = flattenObject(content)
    const filteredContent: Record<string, unknown> = {}

    for (const key of requiredKeys) {
      if (key in flatContent) {
        filteredContent[key] = flatContent[key]
      }
    }

    result[file] = unflattenObject(filteredContent)
  }

  return result
}
