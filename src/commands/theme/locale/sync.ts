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
import { LocaleSourceStats, analyzeLocaleFiles, fetchLocaleSource, syncLocales } from '../../../utilities/locales.js'
import { ThemeTranslations, extractRequiredTranslations, getThemeTranslations } from '../../../utilities/translations.js'
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

    const translations = await this.scanThemeTranslations(themeDir)
    const sourceLocales = await this.fetchAndAnalyzeSource(localesDir)
    await this.syncTranslations(themeDir, translations, sourceLocales)
  }

  private async fetchAndAnalyzeSource(localesDir: string): Promise<{
    locales: Record<string, Record<string, unknown>>,
    stats: LocaleSourceStats
  }> {
    const sourceLocales = await fetchLocaleSource(localesDir)
    const stats = analyzeLocaleFiles(Object.keys(sourceLocales))
    this.logSourceStats(stats)
    return { locales: sourceLocales, stats }
  }

  private getCleanFlags(): string[] {
    return Object.entries(this.flags)
      .filter(([key]) => [Flags.SCHEMA_LOCALES, Flags.STOREFRONT_LOCALES].includes(key))
      .map(([key, value]) => value === false ? `--no-${key}` : null)
      .filter(Boolean) as string[]
  }

  private getSyncMode(): string {
    if (this.flags[Flags.OVERWRITE_LOCALES]) return 'overwrite'
    if (this.flags[Flags.PRESERVE_LOCALES]) return 'preserve'
    return 'merge'
  }

  private logSourceStats(stats: LocaleSourceStats): void {
    if (!this.flags[Flags.QUIET]) {
      this.log(`Found ${stats.totalFiles} locale files in source:`)
      this.log(`- Schema files: ${stats.schemaFiles}`)
      this.log(`- Storefront files: ${stats.storefrontFiles}`)
    }
  }

  private logTranslationStats(stats: ThemeTranslations): void {
    if (!this.flags[Flags.QUIET]) {
      this.log('Found translations in theme:')
      this.log(`- Schema keys: ${stats.schema.size}`)
      this.log(`- Storefront keys: ${stats.storefront.size}`)
    }
  }

  private async scanThemeTranslations(themeDir: string): Promise<ThemeTranslations> {
    const translations = getThemeTranslations(themeDir)
    this.logTranslationStats(translations)
    return translations
  }

  private async syncTranslations(
    themeDir: string,
    translations: ThemeTranslations,
    sourceData: { locales: Record<string, Record<string, unknown>> }
  ): Promise<void> {
    const requiredLocales = extractRequiredTranslations(sourceData.locales, translations)
    const syncMode = this.getSyncMode()
    this.log(`Syncing translations to theme (mode: ${syncMode})`)

    await syncLocales(themeDir, requiredLocales, {
      overwrite: this.flags[Flags.OVERWRITE_LOCALES],
      preserve: this.flags[Flags.PRESERVE_LOCALES]
    })

    if (!this.flags[Flags.QUIET]) {
      this.log('Successfully synced locale files')
    }
  }
}
