/**
 * This command syncs locale files in a theme directory with a source of translations.
 *
 * - Fetches translations from source (remote or local)
 * - Updates theme locale files with source content
 * - Preserves file structure and formatting
 */

import path from 'node:path'

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import Flags from '../../../utilities/flags.js'
import { fetchLocaleSource, syncLocales } from '../../../utilities/locale-sync.js'
import { extractRequiredTranslations, getThemeTranslations } from '../../../utilities/translations.js'
import Clean from './clean.js'

export default class Sync extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.override(Args.THEME_DIR, { default: '.', required: false })
  ])

  static override description = 'Sync theme locale files with source translations'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory',
    '<%= config.bin %> <%= command.id %> theme-directory path/to/locales',
    '<%= config.bin %> <%= command.id %> theme-directory --overwrite-locales',
    '<%= config.bin %> <%= command.id %> theme-directory --preserve-locales'
  ]

  static override flags = Flags.getDefinitions([
    Flags.CLEAN,
    Flags.LOCALES_DIR,
    Flags.OVERWRITE_LOCALES,
    Flags.PRESERVE_LOCALES,
    Flags.SCHEMA_LOCALES,
    Flags.STOREFRONT_LOCALES
  ])


  public async run(): Promise<void> {
    const themeDir = path.resolve(process.cwd(), this.args[Args.THEME_DIR])
    const localesDir = this.flags[Flags.LOCALES_DIR]

    if (this.flags[Flags.CLEAN]) {
      await Clean.run([themeDir, ...this.getCleanFlags()])
    }

    try {
      // 1. Get all translations used in theme
      this.log(`Scanning theme directory: ${themeDir}`)
      const requiredTranslations = getThemeTranslations(themeDir)

      if (!this.flags[Flags.QUIET]) {
        this.log('Found translations in theme:')
        this.log(`- Schema keys: ${requiredTranslations.schema.size}`)
        this.log(`- Storefront keys: ${requiredTranslations.storefront.size}`)
      }

      // 2. Fetch source locales
      this.log(`Fetching locales from: ${localesDir}`)
      const sourceLocales = await fetchLocaleSource(localesDir)
      const localeFiles = Object.keys(sourceLocales)

      if (!this.flags[Flags.QUIET]) {
        this.log(`Found ${localeFiles.length} locale files in source:`)
        this.log(`- Schema files: ${localeFiles.filter(f => f.endsWith('.schema.json')).length}`)
        this.log(`- Storefront files: ${localeFiles.filter(f => !f.endsWith('.schema.json')).length}`)
      }

      // 3. Extract required translations
      this.log('Extracting required translations')
      const requiredLocales = extractRequiredTranslations(sourceLocales, requiredTranslations)

      // 4. Sync to theme
      const syncMode = this.flags[Flags.OVERWRITE_LOCALES] ? 'overwrite' : this.flags[Flags.PRESERVE_LOCALES] ? 'preserve' : 'merge'
      this.log(`Syncing translations to theme (mode: ${syncMode})`)
      await syncLocales(themeDir, requiredLocales, {
        overwrite: this.flags[Flags.OVERWRITE_LOCALES],
        preserve: this.flags[Flags.PRESERVE_LOCALES]
      })

      if (!this.flags[Flags.QUIET]) {
        this.log('Successfully synced locale files')
      }
    } catch (error) {
      this.error(`Failed to sync locales: ${error}`)
    }
  }

  private getCleanFlags(): string[] {
    return Object.entries(this.flags)
      .filter(([key]) => [Flags.SCHEMA_LOCALES, Flags.STOREFRONT_LOCALES].includes(key))
      .map(([key, value]) => value === false ? `--no-${key}` : null)
      .filter(Boolean) as string[]
  }
}
