class Component {
  /** @type {string} **/
  name

  /** @type {string} **/
  rootFolder

  /** @type {ComponentFiles} **/
  files

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

  isSvg() {
    return !!(this.name.startsWith('icon-') || this.name.endsWith('-svg') || this.name.endsWith('.svg'))
  }
}

export default Component
