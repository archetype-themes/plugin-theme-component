class Snippet {
  /** @type {string} **/
  name

  /** @type {string} **/
  file

  /** @type {ComponentBuild} **/
  build

  /** @type {string} **/
  liquidCode

  /** @type {Object} **/
  locales = {}

  /** @type {string[]} **/
  snippetNames

  /** @type {Snippet[]} **/
  snippets = []
}

export default Snippet
