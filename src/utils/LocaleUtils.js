// Node.js imports
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getFileContents, isReadable } from './FileUtils.js'

/**
 * Write Locales
 * @param {Object} locales
 * @param {string} localesFolder
 * @return {Promise<Awaited<void>[]>}
 */
export async function writeLocales(locales, localesFolder) {
  const promises = []

  // Create one file per locale key
  for (const locale of Object.keys(locales)) {
    const localeFilename = join(localesFolder, `${locale}.json`)
    const localeJsonString = JSON.stringify(locales[locale], null, 2)
    if (await isReadable(localeFilename)) {
      const fileContents = await getFileContents(localeFilename)
      if (localeJsonString !== fileContents) {
        promises.push(writeFile(localeFilename, localeJsonString))
      }
    } else {
      promises.push(writeFile(localeFilename, localeJsonString))
    }
  }

  return Promise.all(promises)
}
