import fs, { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { cloneTheme } from './git.js'
import { flattenObject, sortObjectKeys, unflattenObject } from './objects.js'

export interface LocaleContent {
  [key: string]: Record<string, unknown>
}

export interface LocaleDiff {
  added: Set<string>
  modified: Set<string>
  removed: Set<string>
}

export type SyncMode = 'add' | 'replace' | 'update'

export interface SyncOptions {
  format?: boolean
  mode: SyncMode
}

export async function fetchLocaleSource(source: string): Promise<LocaleContent> {
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

export async function syncLocales(
  themeDir: string,
  sourceLocales: Record<string, Record<string, unknown>>,
  options?: Partial<SyncOptions>
): Promise<void> {
  const localesDir = path.join(themeDir, 'locales')
  const { format = false, mode = 'update' } = options ?? {}

  for (const [file, sourceContent] of Object.entries(sourceLocales)) {
    const targetPath = path.join(localesDir, file)

    if (!fs.existsSync(targetPath)) {
      const content = format ? sortObjectKeys(sourceContent) : sourceContent
      fs.writeFileSync(targetPath, JSON.stringify(content, null, 2))
      continue
    }

    const targetContent = JSON.parse(fs.readFileSync(targetPath, 'utf8'))
    const diff = diffLocales(sourceContent, targetContent)

    const mergedContent = mode === 'replace'
      ? replaceTranslations(sourceContent, targetContent)
      : mode === 'add'
        ? addMissingTranslations(sourceContent, targetContent, diff)
        : mergeTranslations(sourceContent, targetContent, diff)

    const content = format ? sortObjectKeys(mergedContent) : mergedContent
    fs.writeFileSync(targetPath, JSON.stringify(content, null, 2))
  }
}

export function diffLocales(source: Record<string, unknown>, target: Record<string, unknown>): LocaleDiff {
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
