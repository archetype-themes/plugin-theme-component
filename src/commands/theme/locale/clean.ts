/**
 * This command cleans up locale files in a theme directory.
 *
 * - Scans theme files for translation keys
 * - Removes unused translations from locale files
 */

import path from 'node:path'

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import Flags from '../../../utilities/flags.js'
import { CleanTarget, FormatOptions, cleanTranslations } from '../../../utilities/translations.js'

export default class Clean extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.override(Args.THEME_DIR, { default: '.', required: false })
  ])

  static override description = 'Remove unused translations from theme locale files'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory',
    '<%= config.bin %> <%= command.id %> theme-directory --target=schema',
    '<%= config.bin %> <%= command.id %> theme-directory --target=storefront'
  ]

  static override flags = Flags.getDefinitions([
    Flags.FORMAT,
    Flags.TARGET
  ])

  protected override async init(): Promise<void> {
    await super.init(Clean)
  }

  public async run(): Promise<void> {
    const themeDir = path.resolve(process.cwd(), this.args[Args.THEME_DIR])
    const target = this.flags[Flags.TARGET] as CleanTarget
    const format = this.flags[Flags.FORMAT]

    const options: FormatOptions = { format }
    await cleanTranslations(themeDir, target, options)

    if (!this.flags[Flags.QUIET]) {
      this.log('Successfully cleaned locale files')
    }
  }
}
