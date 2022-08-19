const HTML_COMMENT_PSEUDO_COMMENT_OR_LT_BANG_REGEXP = new RegExp(
  '<!--[\\s\\S]*?(?:-->)?'
  + '<!---+>?'  // A comment without a body
  + '|<!(?![dD][oO][cC][tT][yY][pP][eE]|\\[CDATA\\[)[^>]*>?'
  + '|<[?][^>]*>?',  // A pseudo-comment
  'g')

/**
 * Filter out HTML Comments from a string
 * @param {string} html
 * @returns {string}
 * @link https://stackoverflow.com/questions/5653207/remove-html-comments-with-regex-in-javascript
 */
function stripHtmlComments (html) {
  return html.replace(HTML_COMMENT_PSEUDO_COMMENT_OR_LT_BANG_REGEXP, '')
}

/**
 * Get JavaScript filenames from within HTML script tags
 * @param {string} html
 * @returns {string[]}
 */
function getScriptFiles (html) {
  let match
  const regex = /<script.*?src="(.*?)"/gmi
  const scriptFiles = []
  while (match = regex.exec(html)) {
    scriptFiles.push(match[1])
  }
  return scriptFiles
}

export {
  getScriptFiles, stripHtmlComments
}