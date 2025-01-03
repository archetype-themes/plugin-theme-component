/** @type {RegExp} **/
const LIQUID_BLOCK_REGEX = /\{%-?.*?-?%}/gs

/** @type {RegExp} **/
const LIQUID_COMMENTS_REGEX = /\{%-?\s*comment\s*-?%}[\s\S]*?\{%-?\s*endcomment\s*-?%}/gi

/** @type {RegExp} **/
const LIQUID_RENDER_REGEX = /\srender\s+'([^']+)'/gs

/**
 * Finds snippet names from render tags in liquid code
 * @param {string} liquidCode
 * @returns {string[]}
 */
export function getSnippetNames(liquidCode) {
  const cleanLiquidCode = stripComments(liquidCode)

  const snippetNames = new Set()
  for (const block of cleanLiquidCode.matchAll(LIQUID_BLOCK_REGEX)) {
    for (const renderMatch of block[0].matchAll(LIQUID_RENDER_REGEX)) {
      snippetNames.add(renderMatch[1])
    }
  }

  return [...snippetNames]
}

export function stripComments(liquidCode) {
  return liquidCode.replace(LIQUID_COMMENTS_REGEX, '')
}
