// External Dependencies
import { basename, join } from 'node:path'

// Internal Dependencies
import {
  ASSETS_FOLDER_NAME,
  CONFIG_FOLDER_NAME,
  LOCALES_FOLDER_NAME,
  SECTIONS_FOLDER_NAME,
  SNIPPETS_FOLDER_NAME,
  LAYOUTS_FOLDER,
  TEMPLATES_FOLDER_NAME
} from '../config/constants.js'
import { layoutFactory } from './layoutFactory.js'
import { templateFactory } from './templateFactory.js'
import { sectionFactory } from './sectionFactory.js'
import Theme from '../models/Theme.js'
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
  theme.layoutsFolder = join(theme.rootFolder, LAYOUTS_FOLDER)
  theme.templatesFolder = join(theme.rootFolder, TEMPLATES_FOLDER_NAME)

  theme.snippetNames = new Set()

  if (await exists(theme.layoutsFolder)) {
    const layoutFiles = await getFiles(theme.layoutsFolder)
    const layoutPromises = layoutFiles.map((layoutFile) => layoutFactory(layoutFile))
    theme.layouts = await Promise.all(layoutPromises)
    theme.layouts.forEach((layout) => layout.snippetNames.forEach((snippetName) => theme.snippetNames.add(snippetName)))

    // TODO Handle the detection of import-map closer to where we generate import-map
    theme.snippetNames.delete('import-map')
  }

  if (await exists(theme.templatesFolder)) {
    const templateFiles = await getFiles(theme.templatesFolder, true)
    const templatePromises = templateFiles
      .filter(templateFile => templateFile.endsWith('.liquid'))
      .map((templateFile) => templateFactory(templateFile))
    theme.templates = await Promise.all(templatePromises)
    theme.templates.forEach((template) => template.snippetNames.forEach((snippetName) => theme.snippetNames.add(snippetName)))
  }

  if (await exists(theme.sectionsFolder)) {
    const sectionFiles = await getFiles(theme.sectionsFolder)
    const sectionPromises = sectionFiles
      .filter(sectionFile => sectionFile.endsWith('.liquid'))
      .map((sectionFile) => sectionFactory(sectionFile))
    theme.sections = await Promise.all(sectionPromises)
    theme.sections.forEach((section) =>
      section.snippetNames.forEach((snippetName) => theme.snippetNames.add(snippetName))
    )
  }

  return theme
}
