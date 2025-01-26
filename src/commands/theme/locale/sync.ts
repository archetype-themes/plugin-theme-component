/**
 * This command syncs locale files in a theme directory with a source of translations.
 *
 * - Fetches translations from source (remote or local)
 * - Updates theme locale files based on selected mode
 * - Preserves file structure and formatting
 */

import path from 'node:path'

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import Flags from '../../../utilities/flags.js'
import { fetchLocaleSource, syncLocales } from '../../../utilities/locales.js'
import {
  CleanTarget,
  ThemeTranslations,
  cleanTranslations,
  extractRequiredTranslations,
  getThemeTranslations
} from '../../../utilities/translations.js'

export default class Sync extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.override(Args.THEME_DIR, { default: '.', required: false })
  ])

  static override description = 'Sync theme locale files with source translations'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory',
    '<%= config.bin %> <%= command.id %> theme-directory --clean',
    '<%= config.bin %> <%= command.id %> theme-directory --clean --target=schema'
  ]

  static override flags = Flags.getDefinitions([
    Flags.CLEAN,
    Flags.FORMAT,
    Flags.LOCALES_DIR,
    Flags.SYNC_MODE,
    Flags.TARGET
  ])

  public async run(): Promise<void> {
    const themeDir = path.resolve(process.cwd(), this.args[Args.THEME_DIR])
    const localesDir = this.flags[Flags.LOCALES_DIR]
    const target = this.flags[Flags.TARGET] as CleanTarget

    if (this.flags[Flags.CLEAN]) {
      await cleanTranslations(themeDir, target)
    }

    const translations = getThemeTranslations(themeDir)
    const sourceLocales = await this.fetchAndAnalyzeSource(localesDir)
    await this.syncTranslations(themeDir, translations, sourceLocales)
  }

  private async fetchAndAnalyzeSource(localesDir: string): Promise<{
    locales: Record<string, Record<string, unknown>>
  }> {
    const sourceLocales = await fetchLocaleSource(localesDir)
    return { locales: sourceLocales }
  }

  private async syncTranslations(
    themeDir: string,
    translations: ThemeTranslations,
    sourceData: { locales: Record<string, Record<string, unknown>> }
  ): Promise<void> {
    const requiredLocales = extractRequiredTranslations(sourceData.locales, translations)
    const format = this.flags[Flags.FORMAT]
    const mode = this.flags[Flags.SYNC_MODE]

    await syncLocales(themeDir, requiredLocales, { format, mode })

    if (!this.flags[Flags.QUIET]) {
      this.log('Successfully synced locale files')
    }
  }
}
