import fs from 'node:fs'
import path from 'node:path'

import { LocaleContent } from './locales.js'
import { flattenObject, unflattenObject } from './objects.js'

export interface ThemeTranslations {
  schema: Set<string>
  storefront: Set<string>
}

const SCHEMA_DIRS = ['config', 'blocks', 'sections'] as const
const STOREFRONT_DIRS = ['blocks', 'layout', 'sections', 'snippets', 'templates'] as const

export function cleanSchemaTranslations(themeDir: string): void {
  const usedKeys = scanFiles(themeDir, SCHEMA_DIRS, findSchemaKeys)
  const localesDir = path.join(themeDir, 'locales')
  const schemaFiles = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.schema.json'))

  for (const file of schemaFiles) {
    cleanLocaleFile(path.join(localesDir, file), usedKeys)
  }
}

export function cleanStorefrontTranslations(themeDir: string): void {
  const usedKeys = scanFiles(themeDir, STOREFRONT_DIRS, findStorefrontKeys)
  const localesDir = path.join(themeDir, 'locales')
  const localeFiles = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.json') && !file.endsWith('.schema.json'))

  for (const file of localeFiles) {
    cleanLocaleFile(path.join(localesDir, file), usedKeys)
  }
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

function cleanLocaleFile(filePath: string, usedKeys: Set<string>): void {
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
    fs.writeFileSync(filePath, JSON.stringify(unflattened, null, 2))
  } catch (error) {
    throw new Error(`Error processing ${path.basename(filePath)}: ${error}`)
  }
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
