import { Section } from '../models/Section.js'
import { basename } from 'node:path'
import { getFileContents } from '../utils/fileUtils.js'
import { getSnippetNames } from '../utils/liquidUtils.js'

export async function sectionFactory(sectionFile) {
  const section = new Section()
  section.name = basename(sectionFile, '.liquid')
  section.file = sectionFile
  section.liquidCode = await getFileContents(section.file)
  section.snippetNames = getSnippetNames(section.liquidCode)
  console.log(section.name)
  console.log(section.snippetNames)
  return section
}
