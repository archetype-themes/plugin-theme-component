// External Dependencies
import { basename } from 'node:path'

// Internal Dependencies
import { Section } from '../models/Section.js'
import { getFileContents } from '../utils/fileUtils.js'
import { getSnippetNames } from '../utils/liquidUtils.js'

export async function sectionFactory(sectionFile) {
  const section = new Section()
  section.name = basename(sectionFile, '.liquid')
  section.file = sectionFile
  section.liquidCode = await getFileContents(section.file)
  section.snippetNames = getSnippetNames(section.liquidCode)

  return section
}
