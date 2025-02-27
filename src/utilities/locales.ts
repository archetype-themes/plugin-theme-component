import fs, { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { writeJsonFile } from './files.js'
import { cloneTheme } from './git.js'
import { flattenObject, unflattenObject } from './objects.js'
import { CleanOptions, LocaleContent, LocaleDiff, LocaleOptions, SyncOptions, TranslationKeysUsedInTheme } from './types.js'

const SCHEMA_DIRS = ['config', 'blocks', 'sections'] as const
const STOREFRONT_DIRS = ['blocks', 'layout', 'sections', 'snippets', 'templates'] as const

export async function getLocalesSource(source: string): Promise<LocaleContent> {
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
  if (!fs.existsSync(dir)) {
    throw new Error(`Directory does not exist: ${dir}`)
  }

  const content: LocaleContent = {}
  const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'))

  for (const file of files) {
    const filePath = path.join(dir, file)

    try {
      content[file] = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch (error) {
      throw new Error(`Failed to parse JSON file ${file}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return content
}

export function findTranslationKeysUsedInTheme(themeDir: string): TranslationKeysUsedInTheme {
  return {
    schema: findKeysInThemeFiles(themeDir, SCHEMA_DIRS, extractSchemaTranslationKeys),
    storefront: findKeysInThemeFiles(themeDir, STOREFRONT_DIRS, extractStorefrontTranslationKeys)
  }
}

function findKeysInThemeFiles(themeDir: string, dirs: readonly string[], findKeys: (content: string) => Set<string>): Set<string> {
  const usedKeys = new Set<string>()

  for (const dir of dirs) {
    const dirPath = path.join(themeDir, dir)
    if (!fs.existsSync(dirPath)) continue

    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.liquid') || file.endsWith('.json'))

    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const content = fs.readFileSync(filePath, 'utf8')
      const keys = findKeys(content)
      for (const key of keys) {
        usedKeys.add(key)
      }
    }
  }

  return usedKeys
}

function extractSchemaTranslationKeys(content: string): Set<string> {
  const keys = new Set<string>()
  const matches = content.match(/"t:([^"]+)"/g) || []

  for (const match of matches) {
    const keyMatch = match.match(/"t:([^"]+)"/)
    if (keyMatch && keyMatch[1]) {
      keys.add(keyMatch[1])
    }
  }

  return keys
}

function extractDynamicTranslationPrefixes(keys: Set<string>): Set<string> {
  const prefixKeys = new Set<string>()
  for (const key of keys) {
    if (key.endsWith('.')) {
      prefixKeys.add(key)
    }
  }

  return prefixKeys
}

function extractStorefrontTranslationKeys(content: string): Set<string> {
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
      const keyMatch = match.match(/["']([^"']+)["']/)
      if (keyMatch && keyMatch[1]) {
        keys.add(keyMatch[1])
      }
    }
  }

  // Find dynamic translation keys (any string ending with a dot followed by t filter)
  // This captures patterns like:
  // - 'prefix.' | append: x | t
  // - 'prefix.' | append: x | replace: '-', '_' | t
  // - assign tag_text = 'tags.' | append: tag_id | t
  // - {% assign tag_text = 'tags.' | append: tag_id | t %}
  // - {{ 'prefix.' | append: x | t }}
  const dynamicPattern = /["']([^"']*\.)["'](?:[^|]*\|)+(?:[^t|]*\|)?\s*t(?::[^%}]*)?[%}]?/g;

  const matches = content.match(dynamicPattern) || [];
  for (const match of matches) {
    const keyMatch = match.match(/["']([^"']*\.)["']/);
    if (keyMatch && keyMatch[1]) {
      const key = keyMatch[1];
      keys.add(key);
    }
  }

  // Combine with t_with_fallback translations
  return new Set([...keys, ...extractTWithFallbackTranslationKeys(content)])
}

function extractTWithFallbackTranslationKeys(content: string): Set<string> {
  // Find translations assigned to variables first
  const assignedTranslations = findTranslationVariables(content)

  // Find both direct keys and variable-based keys
  const directKeys = extractDirectTWithFallbackTranslationKeys(content)
  const variableKeys = extractVariableTWithFallbackTranslationKeys(content, assignedTranslations)

  return new Set([...directKeys, ...variableKeys])
}

function findTranslationVariables(content: string): Map<string, string> {
  const assignments = new Map<string, string>()
  const pattern = /{%-?\s*assign\s+([^\s=]+)\s*=\s*["']([^"']+)["']\s*\|\s*t[^%]*-?%}/g

  const matches = [...content.matchAll(pattern)]
  for (const match of matches) {
    const [, varName, translationKey] = match
    assignments.set(varName, translationKey)
  }

  return assignments
}

function extractDirectTWithFallbackTranslationKeys(content: string): Set<string> {
  const keys = new Set<string>()
  const pattern = /render\s+["']t_with_fallback["'][^%]*key:\s*["']([^"']+)["']/g

  const matches = [...content.matchAll(pattern)]
  for (const match of matches) {
    keys.add(match[1])
  }

  return keys
}

function extractVariableTWithFallbackTranslationKeys(content: string, assignedTranslations: Map<string, string>): Set<string> {
  const keys = new Set<string>()
  const pattern = /render\s+["']t_with_fallback["'][^%]*t:\s*([^\s,}]+)/g

  const matches = [...content.matchAll(pattern)]
  for (const match of matches) {
    const varName = match[1]
    const translationKey = assignedTranslations.get(varName)
    if (translationKey) {
      keys.add(translationKey)
    }
  }

  return keys
}

export async function removeUnreferencedTranslationsFromTheme(
  themeDir: string,
  options: CleanOptions = {}
): Promise<void> {
  const { format, target = 'all' } = options;
  const formatOptions: LocaleOptions = { format };

  switch (target) {
    case 'schema': {
      await removeUnreferencedSchemaTranslations(themeDir, formatOptions)
      break
    }

    case 'storefront': {
      await removeUnreferencedStorefrontTranslations(themeDir, formatOptions)
      break
    }

    default: {
      await removeUnreferencedSchemaTranslations(themeDir, formatOptions)
      await removeUnreferencedStorefrontTranslations(themeDir, formatOptions)
      break
    }
  }
}

export async function removeUnreferencedSchemaTranslations(themeDir: string, options?: LocaleOptions): Promise<void> {
  const usedKeys = findKeysInThemeFiles(themeDir, SCHEMA_DIRS, extractSchemaTranslationKeys)
  const localesDir = path.join(themeDir, 'locales')

  if (!fs.existsSync(localesDir)) {
    throw new Error(`Locales directory does not exist: ${localesDir}`)
  }

  const schemaFiles = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.schema.json'))

  for (const file of schemaFiles) {
    removeUnreferencedKeysFromFile(path.join(localesDir, file), usedKeys, options)
  }
}

export async function removeUnreferencedStorefrontTranslations(themeDir: string, options?: LocaleOptions): Promise<void> {
  const usedKeys = findKeysInThemeFiles(themeDir, STOREFRONT_DIRS, extractStorefrontTranslationKeys)
  const localesDir = path.join(themeDir, 'locales')

  if (!fs.existsSync(localesDir)) {
    throw new Error(`Locales directory does not exist: ${localesDir}`)
  }

  const localeFiles = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.json') && !file.endsWith('.schema.json'))

  for (const file of localeFiles) {
    removeUnreferencedKeysFromFile(path.join(localesDir, file), usedKeys, options)
  }
}

function removeUnreferencedKeysFromFile(filePath: string, usedKeys: Set<string>, options?: LocaleOptions): void {
  if (!fs.existsSync(filePath)) return

  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!content || typeof content !== 'object') return

  const flattenedContent = flattenObject(content)
  const cleanedContent: Record<string, unknown> = {}

  // Extract prefix keys
  const prefixKeys = extractDynamicTranslationPrefixes(usedKeys)

  // Process exact key matches and base paths
  for (const [key, value] of Object.entries(flattenedContent)) {
    const basePath = key.split('.').slice(0, -1).join('.')
    if (usedKeys.has(key) || usedKeys.has(basePath)) {
      cleanedContent[key] = value
      continue
    }

    // Check if this key matches any of the prefix patterns
    let matchesPrefix = false
    for (const prefix of prefixKeys) {
      if (key.startsWith(prefix)) {
        matchesPrefix = true
        break
      }
    }

    if (matchesPrefix) {
      cleanedContent[key] = value
    }
  }

  const unflattened = unflattenObject(cleanedContent)
  writeJsonFile(filePath, unflattened, options)
}

export async function mergeLocaleFiles(
  themeDir: string,
  sourceLocales: Record<string, Record<string, unknown>>,
  options?: SyncOptions
): Promise<void> {
  const localesDir = path.join(themeDir, 'locales')
  const { format = false, mode = 'add-missing', target = 'all' } = options ?? {}

  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true })
  }

  const filesToSync = Object.entries(sourceLocales).filter(([file]) => {
    const isSchemaFile = file.endsWith('.schema.json')

    if (target === 'schema') return isSchemaFile
    if (target === 'storefront') return !isSchemaFile
    return true
  })

  for (const [file, sourceContent] of filesToSync) {
    const targetPath = path.join(localesDir, file)

    if (!fs.existsSync(targetPath)) {
      writeJsonFile(targetPath, sourceContent, { format })
      continue
    }

    const targetContent = JSON.parse(fs.readFileSync(targetPath, 'utf8'))
    const diff = compareLocales(sourceContent, targetContent)

    const mergedContent = mode === 'replace-existing'
      ? replaceExistingTranslationsWithSourceValues(sourceContent, targetContent)
      : mode === 'add-missing'
        ? addMissingTranslationsFromSource(sourceContent, targetContent, diff)
        : addAndOverrideTranslationsFromSource(sourceContent, targetContent, diff)

    writeJsonFile(targetPath, mergedContent, { format })
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

function replaceExistingTranslationsWithSourceValues(
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

function addMissingTranslationsFromSource(
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

function addAndOverrideTranslationsFromSource(
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

export function filterSourceTranslationsToKeysUsedInTheme(
  localesContent: Record<string, Record<string, unknown>>,
  required: TranslationKeysUsedInTheme
): LocaleContent {
  const result: LocaleContent = {}

  for (const [file, content] of Object.entries(localesContent)) {
    const isSchema = file.endsWith('.schema.json')
    const requiredKeys = isSchema ? required.schema : required.storefront
    const flatContent = flattenObject(content)

    result[file] = unflattenObject(filterContentByKeys(flatContent, requiredKeys))
  }

  return result
}

function filterContentByKeys(
  flatContent: Record<string, unknown>,
  requiredKeys: Set<string>
): Record<string, unknown> {
  const filteredContent: Record<string, unknown> = {}
  const prefixKeys = extractDynamicTranslationPrefixes(requiredKeys)

  // Process exact key matches
  for (const key of requiredKeys) {
    if (key in flatContent) {
      filteredContent[key] = flatContent[key]
    }
  }

  // Handle prefix matches for dynamic keys
  for (const prefix of prefixKeys) {
    for (const sourceKey of Object.keys(flatContent)) {
      if (sourceKey.startsWith(prefix) && !(sourceKey in filteredContent)) {
        filteredContent[sourceKey] = flatContent[sourceKey]
      }
    }
  }

  return filteredContent
}
