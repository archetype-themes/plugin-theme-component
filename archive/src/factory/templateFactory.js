// External Dependencies
import { basename } from 'node:path'

// Internal Dependencies
import { Template } from '../models/Template.js'
import { getFileContents } from '../utils/fileUtils.js'
import { getSnippetNames } from '../utils/liquidUtils.js'
 
export async function templateFactory(templateFile) {
  const template = new Template()
  template.name = basename(templateFile, '.liquid')
  template.file = templateFile
  template.liquidCode = await getFileContents(template.file)
  template.snippetNames = getSnippetNames(template.liquidCode)

  return template
}
