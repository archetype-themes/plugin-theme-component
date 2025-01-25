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
    '<%= config.bin %> <%= command.id %> theme-directory',
    '<%= config.bin %> <%= command.id %> theme-directory --no-schema-locales',
    '<%= config.bin %> <%= command.id %> theme-directory --no-storefront-locales'
  ]

  static override flags = Flags.getDefinitions([
    Flags.SCHEMA_LOCALES,
    Flags.STOREFRONT_LOCALES
  ])

  protected override async init(): Promise<void> {
    await super.init(Clean)
  }

  public async run(): Promise<void> {
    const themeDir = path.resolve(process.cwd(), this.args[Args.THEME_DIR])
    const schemaLocales = this.flags[Flags.SCHEMA_LOCALES]
    const storefrontLocales = this.flags[Flags.STOREFRONT_LOCALES]

    if (!schemaLocales && !storefrontLocales) {
      this.error('Cannot disable cleaning of both schema and storefront locales. Remove either --no-schema-locales or --no-storefront-locales flag')
    }

    if (storefrontLocales) {
      cleanStorefrontTranslations(themeDir)
    }

    if (schemaLocales) {
      cleanSchemaTranslations(themeDir)
    }

    if (!this.flags[Flags.QUIET]) {
      this.log('Successfully cleaned translations from locale files')
    }
  }
}
