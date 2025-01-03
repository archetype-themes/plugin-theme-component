// External Dependencies
import { basename } from 'node:path'

// Internal Dependencies
import { Layout } from '../models/Layout.js'
import { getFileContents } from '../utils/fileUtils.js'
import { getSnippetNames } from '../utils/liquidUtils.js'

export async function layoutFactory(layoutFile) {
  const layout = new Layout()
  layout.name = basename(layoutFile, '.liquid')
  layout.file = layoutFile
  layout.liquidCode = await getFileContents(layout.file)
  layout.snippetNames = getSnippetNames(layout.liquidCode)

  return layout
}
