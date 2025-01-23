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
import { cleanSchemaTranslations, cleanStorefrontTranslations } from '../../../utilities/translations.js'

export default class Clean extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.override(Args.THEME_DIR, { default: '.', required: false })
  ])

  static override description = 'Clean theme locale files'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory'
  ]

  protected override async init(): Promise<void> {
    await super.init(Clean)
  }

  public async run(): Promise<void> {
    const themeDir = path.resolve(process.cwd(), this.args[Args.THEME_DIR])

    cleanStorefrontTranslations(themeDir)
    cleanSchemaTranslations(themeDir)

    if (!this.flags[Flags.QUIET]) {
      this.log('Successfully cleaned translations from locale files')
    }
  }
}
