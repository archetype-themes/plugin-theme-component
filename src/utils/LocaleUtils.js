// Node.js imports
import { writeFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Write Locales
 * @param {Object} locales
 * @param {string} localesFolder
 * @return {Promise<Awaited<void>[]>}
 */
export async function writeLocales (locales, localesFolder) {
  const promises = []

  // Create one file per locale key
  for (const locale of Object.keys(locales)) {
    const localeFilename = join(localesFolder, `${locale}.json`)
    const localeJsonString = JSON.stringify(locales[locale], null, 2)
    if (existsSync(localeFilename)) {
      const fileContents = readFileSync(localeFilename, 'utf8')
      if (localeJsonString !== fileContents) {
        promises.push(writeFile(localeFilename, localeJsonString))
      }
    } else {
      promises.push(writeFile(localeFilename, localeJsonString))
    }
  }

  return Promise.all(promises)
}

export default { writeLocales }
