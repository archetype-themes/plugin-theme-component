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
import { filterSourceTranslationsToKeysUsedInTheme, findTranslationKeysUsedInTheme, getLocalesSource, mergeLocaleFiles, removeUnreferencedTranslationsFromTheme } from '../../../utilities/locales.js'
import { CleanOptions, CleanTarget, SyncOptions, TranslationKeysUsedInTheme } from '../../../utilities/types.js'

export default class Sync extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.override(Args.THEME_DIR, { default: '.', required: false })
  ])

  static override description = 'Sync theme locale files with source translations'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory',
    '<%= config.bin %> <%= command.id %> theme-directory --clean',
    '<%= config.bin %> <%= command.id %> theme-directory --clean --target=schema',
    '<%= config.bin %> <%= command.id %> theme-directory --locales-source=path/to/directory'
  ]

  static override flags = Flags.getDefinitions([
    Flags.CLEAN,
    Flags.FORMAT,
    Flags.LOCALES_SOURCE,
    Flags.MODE,
    Flags.TARGET
  ])

  public async run(): Promise<void> {
    const themeDir = path.resolve(process.cwd(), this.args[Args.THEME_DIR])
    const localesSource = this.flags[Flags.LOCALES_SOURCE]
    const target = this.flags[Flags.TARGET] as CleanTarget
    const format = this.flags[Flags.FORMAT]

    const translations = findTranslationKeysUsedInTheme(themeDir)
    const localesContent = await getLocalesSource(localesSource)
    await this.mergeTranslationsWithTheme(themeDir, translations, localesContent)

    if (this.flags[Flags.CLEAN]) {
      const options: CleanOptions = { format, target }
      await removeUnreferencedTranslationsFromTheme(themeDir, options)
    }
  }

  private async mergeTranslationsWithTheme(
    themeDir: string,
    translations: TranslationKeysUsedInTheme,
    localesContent: Record<string, Record<string, unknown>>
  ): Promise<void> {
    const options: SyncOptions = {
      format: this.flags[Flags.FORMAT],
      mode: this.flags[Flags.MODE],
      target: this.flags[Flags.TARGET] as CleanTarget
    }

    const filteredLocalesContent = filterSourceTranslationsToKeysUsedInTheme(localesContent, translations)
    await mergeLocaleFiles(themeDir, filteredLocalesContent, options)

    if (!this.flags[Flags.QUIET]) {
      this.log('Successfully synced locale files')
    }
  }
}
