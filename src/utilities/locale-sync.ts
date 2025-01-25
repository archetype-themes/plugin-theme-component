import fs, { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { cloneTheme } from './git.js'
import { flattenObject, sortObjectKeys, unflattenObject } from './objects.js'
import { LocaleContent } from './translations.js'

interface LocaleDiff {
  added: Set<string>
  modified: Set<string>
  removed: Set<string>
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

  const files = fs.readdirSync(dir)
    .filter(file => file.endsWith('.json'))

  for (const file of files) {
    const filePath = path.join(dir, file)
    content[file] = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>
  }

  return content
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

export async function syncLocales(
  themeDir: string,
  sourceLocales: Record<string, Record<string, unknown>>,
  options: { overwrite?: boolean, preserve?: boolean }
): Promise<void> {
  const localesDir = path.join(themeDir, 'locales')

  for (const [file, content] of Object.entries(sourceLocales)) {
    const targetPath = path.join(localesDir, file)

    if (!fs.existsSync(targetPath)) {
      // fs.writeFileSync(targetPath, JSON.stringify(sortObjectKeys(content), null, 2))
      fs.writeFileSync(targetPath, JSON.stringify(content, null, 2))
      continue
    }

    const targetContent = JSON.parse(fs.readFileSync(targetPath, 'utf8'))
    const diff = compareLocales(content, targetContent)

    if (options.preserve) {
      // Only add new translations
      const merged = {...targetContent}
      const flatContent = flattenObject(content)
      const flatMerged = flattenObject(merged)

      for (const key of diff.added) {
        flatMerged[key] = flatContent[key]
      }

      // fs.writeFileSync(targetPath, JSON.stringify(sortObjectKeys(unflattenObject(flatMerged)), null, 2))
      fs.writeFileSync(targetPath, JSON.stringify(unflattenObject(flatMerged), null, 2))
    } else if (options.overwrite) {
      // Use source version entirely
      // fs.writeFileSync(targetPath, JSON.stringify(sortObjectKeys(content), null, 2))
      fs.writeFileSync(targetPath, JSON.stringify(content, null, 2))
    } else {
      // Selective merge based on diffs
      const merged = {...targetContent}
      const flatContent = flattenObject(content)
      const flatMerged = flattenObject(merged)

      for (const key of [...diff.added, ...diff.modified]) {
        flatMerged[key] = flatContent[key]
      }

      // fs.writeFileSync(targetPath, JSON.stringify(sortObjectKeys(unflattenObject(flatMerged)), null, 2))
      fs.writeFileSync(targetPath, JSON.stringify(unflattenObject(flatMerged), null, 2))
    }
  }
}
