import fs from 'node:fs'
import path from 'node:path'

import { flattenObject, unflattenObject } from './objects.js'

const SCHEMA_DIRS = ['config', 'blocks', 'sections'] as const
const LIQUID_DIRS = ['blocks', 'layout', 'sections', 'snippets', 'templates'] as const

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
  const patterns = [
    /{{\s*-?\s*["']([^"']+)["']\s*\|\s*t[^}]*-?\s*}}/g,
    /{%\s*(?:assign|capture)\s+\w+\s*=\s*["']([^"']+)["']\s*\|\s*t[^%]*%}/g,
    /(?:^|\s)["']([^"']+)["']\s*\|\s*t[^\n}]*/gm
  ]

  for (const pattern of patterns) {
    const matches = content.match(pattern) || []
    for (const match of matches) {
      const key = match.match(/["']([^"']+)["']/)![1]
      keys.add(key)
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
  const usedKeys = scanFiles(themeDir, LIQUID_DIRS, findStorefrontKeys)
  const localesDir = path.join(themeDir, 'locales')
  const localeFiles = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.json') && !file.endsWith('.schema.json'))

  for (const file of localeFiles) {
    cleanLocaleFile(path.join(localesDir, file), usedKeys)
  }
}
