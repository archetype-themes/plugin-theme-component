// External Dependencies
import { basename, join } from 'node:path'

// Internal Dependencies
import {
  ASSETS_FOLDER_NAME,
  CONFIG_FOLDER_NAME,
  LOCALES_FOLDER_NAME,
  SECTIONS_FOLDER_NAME,
  SNIPPETS_FOLDER_NAME
} from '../config/constants.js'
import Theme from '../models/Theme.js'
import { sectionFactory } from './sectionFactory.js'
import { exists, getFiles } from '../utils/fileUtils.js'

/**
 * Theme Factory
 * @param {string} themePath
 * @return {Theme}
 */
export async function themeFactory(themePath) {
  const theme = new Theme()

  theme.name = basename(themePath)
  theme.rootFolder = themePath
  theme.assetsFolder = join(theme.rootFolder, ASSETS_FOLDER_NAME)
  theme.configFolder = join(theme.rootFolder, CONFIG_FOLDER_NAME)
  theme.localesFolder = join(theme.rootFolder, LOCALES_FOLDER_NAME)
  theme.sectionsFolder = join(theme.rootFolder, SECTIONS_FOLDER_NAME)
  theme.snippetsFolder = join(theme.rootFolder, SNIPPETS_FOLDER_NAME)

  if (await exists(theme.sectionsFolder)) {
    const sectionFiles = await getFiles(theme.sectionsFolder)
    const sectionPromises = sectionFiles.map((sectionFile) => sectionFactory(sectionFile))
    theme.sections = await Promise.all(sectionPromises)
    theme.snippetNames = new Set(theme.sections.flatMap((section) => section.snippetNames))
  }

  return theme
}
