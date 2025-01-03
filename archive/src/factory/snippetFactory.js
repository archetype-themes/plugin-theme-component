import Snippet from '../models/Snippet.js'
import { dirname, parse } from 'node:path'
import { getFileContents } from '../utils/fileUtils.js'
import ComponentFiles from '../models/ComponentFiles.js'
import { error } from '../utils/logger.js'
import { getSnippetNames } from '../utils/liquidUtils.js'

/**
 * Snippet Factory
 * @param snippetFile
 * @return {Promise<Snippet>}
 */
export async function snippetFactory(snippetFile) {
  const snippet = new Snippet()
  snippet.name = parse(snippetFile).name
  snippet.rootFolder = dirname(snippetFile)

  // Snippet Files Initialization
  snippet.files = new ComponentFiles()
  snippet.files.liquidFile = snippetFile

  // Load Liquid Code
  snippet.liquidCode = await getFileContents(snippet.files.liquidFile)

  // Find snippet names in render tags
  snippet.snippetNames = getSnippetNames(snippet.liquidCode)

  // Warn When A Possible Recursive Render Call Is Made
  if (snippet.snippetNames.includes(snippet.name)) {
    error(`The "${snippet.name}" snippet is trying to render itself, which could lead to a recursive infinite loop.`)
  }

  return snippet
}
